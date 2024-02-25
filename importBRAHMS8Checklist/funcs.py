import re
from os import path
import mysql.connector
from mysql.connector import errorcode
from treelib import Tree
import csv

def getDatabaseConnection(credentials):
  try:
    cnx = mysql.connector.connect(**credentials)
  except mysql.connector.Error as err:
    if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
      raise Exception("Something is wrong with your user name or password")
    elif err.errno == errorcode.ER_BAD_DB_ERROR:
      raise Exception("Database does not exist")
    else:
      raise Exception(err)
  return cnx

def getSpecifyUserID(connection, username):
  cursor = connection.cursor(dictionary=True)
  sql = "select SpecifyUserID as id, name as username, usertype from specifyuser where name = %s"
  cursor.execute(sql, (username,))
  users = cursor.fetchall()
  cursor.close()
  if len(users) < 1 or len(users) > 1:
    raise Exception('there is an error for user {}. Check this user exists and there is only one instance in the database and try again.'.format(username))
  else:
    spuser = users[0]
    return spuser["id"]
  
def getTreedefItems(connection, discipline):
  cursor = connection.cursor(dictionary=True)
  sql = "select disciplineid, name, taxontreedefid as treedefid from discipline where name = %s"
  cursor.execute(sql, (discipline,))
  disciplines = cursor.fetchall()
  if len(disciplines) < 1 or len(disciplines) > 1:
    raise Exception('there is an error for discipline {}. Check this discipline exists and and try again.'.format(discipline))
  else:
    ttd_id = disciplines[0]["treedefid"]
    sql = "select taxontreedefitemid as itemid, taxontreedefid as treedefid, parentitemid as parent_id, name as taxonrank, rankid, isinfullname from taxontreedefitem where taxontreedefid = %s" 
    cursor.execute(sql, (ttd_id,))
    treedefitems = cursor.fetchall()
    cursor.close()
    return treedefitems

def addNodeNumbers(tree, node, parentNodeNumber):
  if node:
    node.data["nodenumberschanged"] = False #so we can use it later if needed
    if "nodenumber" not in node.data or node.data["nodenumber"] != parentNodeNumber + 1:
      node.data["nodenumber"] = parentNodeNumber + 1
      node.data["nodenumberschanged"] = True

    highestChildNodeNumber = node.data["nodenumber"] # for leaf nodes
    for child in tree.children(node.identifier):
      highestChildNodeNumber = addNodeNumbers(tree, child, highestChildNodeNumber)

    if 'highestchildnodenumber' not in node.data or node.data["highestchildnodenumber"] != highestChildNodeNumber:
      node.data["highestchildnodenumber"] = highestChildNodeNumber
      node.data["nodenumberschanged"] = True

    return highestChildNodeNumber

def buildTreeFromFile(fileDir, fileName, mapping, root_taxon, taxon_field_indexes, treedefitems, cultivar_field, cultivar_author_field, userid):
  
  tree = Tree()
  root = tree.create_node(root_taxon, root_taxon, data = {"taxontreedefid": treedefitems[0]["treedefid"]})  # we need the treedefID for addToDatabase later
  parent = root
  counter = 0
  rank_prefixes = {
    "subspecies": "subsp.",
    "variety": "var.",
    "subvariety": "subvar.",
    "form": "f.",
    "forma": "f.",
    "subform": "subf.",
    "subforma": "subf."
  }

  # read the file and build the tree
  with open(path.join(fileDir, fileName), 'r', encoding="utf-8-sig", errors="ignore") as data:
    fieldsChecked = False
    for record in csv.DictReader(data):
      if not fieldsChecked and not all(mapping[sp_field] in record for sp_field in mapping):
        raise Exception('The list of fields provided are not all in the source dataset. Please correct and try again...')
      else:
        fieldsChecked = True
        parent = root #has to be reset for each row, taking advantage of value carry through between iterations
        author = None

        # walk through the fields and get all the taxa
        fullnameparts = []
        
        for index in range(taxon_field_indexes[0], taxon_field_indexes[1]):

          taxon_props = {} # the properties we're going to record for this node

          field = list(record.keys())[index]
          # skip author fields because we handle them with the names below
          if 'author' in field.lower():
            continue

          name_part = record[field]
          taxon_props["name"] = name_part

          if name_part != None and name_part.strip() != '':
            field_rank = field.lower().replace('name', '') #because we have ClassName, OrderName, etc

            taxon_props["isHybrid"] = False
            if field_rank == 'genus' and record["GenusHybrid"] and record["GenusHybrid"].strip() != '':
              taxon_props["isHybrid"] = True

            if field_rank == 'species' and record["SpeciesHybrid"] and record["SpeciesHybrid"].strip() != '':
              taxon_props["isHybrid"] = True

            # we don't have hybrid fields for lower ranks so they've been indicated with x
            if name_part.startswith('x '):
              taxon_props["isHybrid"] = True
              name_part = re.sub('$x\s+', '', name_part)

            #confirm this rank is in the tree def
            try:
              ttdi = [d for d in treedefitems if d.get('taxonrank').lower() == field_rank][0]
            except:
              ttdi = None
            if not ttdi:
              raise Exception("rank {} is not in the taxon tree definition for this discipline".format(field_rank))          

            # continue with building the tree
            # first look to see if we have an author field and value
            nextfield = ''
            if index < taxon_field_indexes[1]:
              nextfield = list(record.keys())[index + 1]

            if 'author' in nextfield.lower() and record[nextfield] and record[nextfield].strip():
              author = record[nextfield].strip()
              
            # build the fullname
            if ttdi["isinfullname"]:
              if field_rank in rank_prefixes:
                fullnameparts.append(rank_prefixes[field_rank]) 

              if taxon_props['isHybrid'] is True:  
                fullnameparts.append('× ' + name_part) #this is a multiplication sign
              else:
                fullnameparts.append(name_part)

              #insert the author where it belongs
              if author:
                for partindex, part in reversed(list(enumerate(fullnameparts))): # we start at the end and search for where the current namepart and the earlier part are different
                  
                  if part in rank_prefixes.values():
                    continue
                  
                  previous_part = fullnameparts[partindex - 1]
                  if previous_part in rank_prefixes.values(): #exclude ranks
                    previous_part = fullnameparts[partindex - 2]
                  if part != previous_part:
                    fullnameparts.insert(partindex + 1, author) 
                    break

              # we only add cultivars if this is the last name part
              remaining_fields = list(record.keys())[index + 2: taxon_field_indexes[1] + 1]
              cultivar = None
              if all(record[field] is None or record[field].strip() == '' for field in remaining_fields): 
                if record[cultivar_field] and record[cultivar_field].strip():
                  cultivar = record[cultivar_field].strip()
                  taxon_props['cultivarname']
                  if "'" not in cultivar: 
                    cultivar = "'" + cultivar.strip() + "'" #add the single quotes
                  fullnameparts.append(cultivar)
                  if record[cultivar_author_field] and record[cultivar_author_field].strip():
                    cultivar_author = record[cultivar_author_field].strip()
                    taxon_props["text6"] = cultivar_author #TODO taken straight from the mapping, must be updated when we get this field in Specify
                    if author in fullnameparts:
                      fullnameparts.remove(author) #remove again so we can use the list for lower ranks
                    fullnameparts.append(cultivar_author.strip())

                  # we sometimes have cultivars with a genus name only. In these cases the cultivar effectively becomes the species so we have to update the ttdi
                  if field_rank.lower() == 'genus':
                    ttdi = [d for d in treedefitems if d.get('taxonrank').lower() == 'species'][0]
                  
                  # add the cultivar name to the name field so we can see it in Specify's tree view
                  taxon_props["name"] = (taxon_props["name"] + ' ' + cultivar).strip()

              # make the fullname
              identifier = ' '.join(fullnameparts)
              if author in fullnameparts:
                fullnameparts.remove(author) #remove again so we can use the list for lower ranks
              
            else:
              identifier = name_part
              if author:
                identifier += ' ' + author

            # do we have this taxon already?
            node = tree.get_node(identifier)
            if node is None:
              taxon_props['version'] = 0 #required by Specify
              taxon_props["fullname"] = identifier
              taxon_props['author'] = author
              taxon_props["isAccepted"] = True #to be updated later
              taxon_props["createdbyagentid"] = userid
              taxon_props["taxontreedefid"] = ttdi["treedefid"]
              taxon_props["taxontreedefitemid"] = ttdi["itemid"]
              taxon_props["rankid"] = ttdi["rankid"]
              node = tree.create_node(None, identifier, parent, data=taxon_props)
              counter += 1

            parent = node

        # we're now at the end of the set of taxon fields, so the rest of the data for this row should be the leaf taxon properties
        for specify_field, dataset_field in mapping.items():
          value = record[dataset_field]
          if value and value.strip():
            node.data[specify_field] = value.strip()
      
        if counter % 1000 == 0:
          print(counter, 'records processed', end='\r')


  return tree

# Note this function relies on node numbers being up to date for getting subtrees. If root_taxon is None it pulls the entire tree
def buildTreeFromDatabase(connection, treedefid, root_taxon, fields=[]):

  #as a minimum we need the ids to construct the tree
  lower_fields = list(map(str.lower, fields))
  if 'parentid' not in lower_fields:
    fields.insert(0, 'parentid')
    lower_fields.insert(0, 'parentid')

  if 'taxonid' not in lower_fields:
    fields.insert(0, 'taxonid')
    lower_fields.insert(0, 'taxonid')

  #because we can't guarantee the case of these fields:
  taxonid_field_index = lower_fields.index('taxonid')
  taxonid_field = fields[taxonid_field_index]
  parentid_field_index = lower_fields.index('parentid')
  parentid_field = fields[parentid_field_index]

  #build the tree
  tree = Tree()
  cursor = connection.cursor(dictionary=True)

  # get the root taxon
  root = None
  if root_taxon:

    sql = 'select ' + ', '.join(fields) + ', nodenumber, highestchildnodenumber from taxon where taxontreedefid = %s and fullname = %s'
    cursor.execute(sql, (treedefid, root_taxon))
    taxa = cursor.fetchall() #there should only be one
    if len(taxa) ==0:
      raise Exception('no taxon found with name ' + root_taxon)
    if len(taxa) > 1:
      raise Exception('more than one taxon exists with name ' + root_taxon)
    
    #start with the root
    root_taxon = taxa[0]
    root = tree.create_node(identifier=root_taxon[taxonid_field], data=root_taxon)

  #get all the taxa under the root taxon
  sql = 'select ' + ', '.join(fields) + ' from taxon where taxontreedefid = %s'
  if root:
    sql += ' and nodenumber between %s and %s'
    cursor.execute(sql, (treedefid, root_taxon['nodenumber'], root_taxon['highestchildnodenumber']))
  else:
    cursor.execute(sql, (treedefid,))
  taxa = cursor.fetchall()

  #add them to the tree
  taxa = sorted(taxa, key=lambda d: (d[parentid_field] is not None, d[parentid_field])) # so that we can just go from top to bottom to build the tree
  
  if root:
    del taxa[0] #its the parent, we already have it
  
  for taxon in taxa:
    tree.create_node(identifier=taxon[taxonid_field], parent=taxon[parentid_field], data=taxon)

  cursor.close()

  return tree

def addToDatabase(connection, tree, node, progress):
  """Adds a taxon node to the Specify tree, if it does not already exist. If there are duplicates it warns and uses the first one to continue.
  
  Parameters
  ----------
  connection: MySQL database connection
  tree: Treelib.Tree
  node: Treelib.Node
  treeDefID: number
    The treeDefID of the Specify discipline tree to update
  spuserID: number
    The ID of the Specify user to record as having made the updates
  progress: Any
    Optional: A progress tracker with a next() method
  """

  #first check if we already have this record in the db, or if it is duplicated
  cursor = connection.cursor(dictionary=True)
  sql = 'select taxonID, name, fullname from taxon where taxontreedefid = %s and fullname = %s'
  cursor.execute(sql, (node.data["taxontreedefid"], node.identifier))
  taxa = cursor.fetchall()
  if not taxa:
    #get the parent
    parent = tree.parent(node.identifier)
    node.data["parentid"] = parent.data["taxonID"]

    sql1 = 'insert into taxon ('
    sql2 = ') values ('
    vals = []
    for key, val in node.data.items():
      sql1 += key + ', '
      sql2 += '%s, '
      vals.append(val)

    sql1 += 'timestampcreated'
    sql2 += 'NOW()'

    sql = sql1 + sql2 + ")"

    cursor.execute(sql, vals)
    node.data["taxonID"] = cursor.lastrowid
    if progress:
      progress.next()

  else:
    taxon = taxa[0]
    node.data["taxonID"] = taxon["taxonID"] 

  cursor.close()

  for child in tree.children(node.identifier):
    addToDatabase(connection, tree, child, progress)

# this will not delete the root node, life, assuming taxonID of life is always 1
def deleteFromDatabase(connection, tree, bar):
  '''the node identifers of tree must be the taxonids'''

  cursor = connection.cursor()

  #we first have to remove acceptedTaxon references
  all_taxonids = tree.nodes.keys()
  placeholders = ', '.join(['%s'] * len(all_taxonids))
  sql = 'update taxon set acceptedid = null where taxonid in (%s)' % placeholders
  cursor.execute(sql, tuple(all_taxonids))
  connection.commit()
  
  #then we remove leaves until there is no more tree left...
  deletecount = 0
  while len(tree) > 0:
    leaves = tree.leaves()
    taxonids = list(map(lambda x: x.identifier, leaves))

    #safety brake for Life
    if 1 in taxonids:
      break

    placeholders = ', '.join(['%s'] * len(taxonids))
    sql = 'delete from taxon where taxonid in (%s)' % placeholders
    cursor.execute(sql, tuple(taxonids))
    deletecount += cursor.rowcount
    for leaf in leaves:
      tree.remove_node(leaf.identifier)
    
    if bar:
      bar.next(cursor.rowcount)

  cursor.close()
  connection.commit()

  return deletecount

def updateTreeNodeNumbers(connection, treedefid):
  
  print('building tree from database')
  try:
    tree = buildTreeFromDatabase(connection, treedefid, None, ['nodenumber', 'highestchildnodenumber'])
  except Exception as ex:
    raise ex
  
  print('computing node numbers')
  addNodeNumbers(tree, tree.get_node(tree.root), 0)
  
  # we only update if there are updates to be made
  updated_nodes = list(filter(lambda node: node.data["nodenumberschanged"], tree.nodes.values()))
  if len(updated_nodes) > 0:
    
    print('updating database records')
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_update_table (
            taxonid INT,
            nodenumber INT,
            highestchildnodenumber INT
        )
    """)

    sql = "INSERT INTO temp_update_table (taxonid, nodenumber, highestchildnodenumber) VALUES (%s, %s, %s)"
    insert_values = [(node.identifier, node.data["nodenumber"], node.data["highestchildnodenumber"]) for node in updated_nodes]
    cursor.executemany(sql, insert_values)

    # update taxon with the new node numbers
    sql = """
          UPDATE taxon
          JOIN temp_update_table ON taxon.taxonid = temp_update_table.taxonid
          SET taxon.nodenumber = temp_update_table.nodenumber, taxon.highestchildnodenumber = temp_update_table.highestchildnodenumber
      """
    cursor.execute(sql)

    #drop the temporary table
    cursor.execute("DROP TEMPORARY TABLE IF EXISTS temp_update_table")

    cursor.close()

  return len(updated_nodes)

def updateAcceptedTaxa(connection, treedefid, guidfield, acceptedguidfield):
  cursor = connection.cursor(dictionary=True)

  sql = """
        update taxon synonym
        join taxon accepted 
        on accepted.{0} = synonym.{1}
        set synonym.acceptedid = accepted.taxonid
        where synonym.taxontreedefid = %s and accepted.taxontreedefid = %s and  synonym.{1} is not null
    """.format(guidfield, acceptedguidfield)
  
  cursor.execute(sql, (treedefid, treedefid))

  cursor.close()
  return cursor.rowcount

def addFieldIndex(connection, database_name, tablename, *fields):
  
  cursor = connection.cursor(dictionary=True)
  indexesAdded = []
  for field in fields:
  
  #first check if the index is there already
    sql = """
      SELECT *
      FROM INFORMATION_SCHEMA.STATISTICS
      WHERE TABLE_SCHEMA = '{0}' -- The name of your database
        AND TABLE_NAME = '{1}' -- The name of your table
        AND COLUMN_NAME IN  -- The names of your columns
    """.format(database_name, tablename)

    placeholders = ', '.join(['%s'] * len(fields))
    sql += '(%s)' % placeholders

    cursor.execute(sql, fields)
    results = cursor.fetchall()
    for field in fields:
      if not any(result.get('COLUMN_NAME').lower() == field.lower() for result in results):
        sql = """
          ALTER TABLE {0}
          ADD INDEX ({1});
      """.format(tablename, field)
        cursor.execute(sql)
        indexesAdded.append(field)
    
  cursor.close()
  return indexesAdded


  



    


