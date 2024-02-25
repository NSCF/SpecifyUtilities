# Takes a taxon checklist exported from BRAHMS 8 and imports to Specify taxon table. 
# Note this will check if each taxon is already in the tree using the wfo-id or the full name-author combination
# and only create new new taxa where necessary. 
# The imported dataset needs to be prepared first so that all taxon fields come one after the other. 
# Each name field must be succeeded by the author field if it exists, which must contain 'author' as part of the field name.
# The rank fields in the dataset must match those in the Specify taxon tree definition (an error will be shown otherwise)
# The field mapping is per taxon record, and must use the raw database field names (not the customized schema names).
# Cultivar names and their authorities should be in a single field, with the name quoted. The field also needs to appear in the mapping below.  
# This script was developed to avoid having to separate out all the properties into separate fields for their taxon ranks, as required by the Specify workbench.
# It is also more efficient for importing large checklists from BRAHMS (e.g. the South African plant checklist)
# It also automatically links up all acceptedTaxonID fields afterwards.
# Note this script needs Python V3.7+ so that order of values in dictionaries is preserved.

import time, sys
from funcs import getSpecifyUserID, \
getTreedefItems, getDatabaseConnection, buildTreeFromFile, \
addNodeNumbers, addToDatabase, buildTreeFromDatabase, updateTreeNodeNumbers, updateAcceptedTaxa, addFieldIndex
from progress.bar import Bar

fileDir = r'C:\Users\Ian Engelbrecht\Downloads'
sourceFile = r'SANBI-TaxonBackbone-Export-20231120-OpenRefine-withHigherClass-OpenRefine.csv'

# the discipline in Specify to which the taxon tree belongs
sp_discipline = "botany"

# the root taxon in the Specify taxon tree to add all of the taxon records to
# note that only fields with ranks below the root taxon rank should be included in taxon_field_indexes below
root_taxon = 'life'

# the indexes of the fields in the dataset that contain the taxon fields (starting from zero)
# see note above on the root taxon
taxon_field_indexes = [10, 28]

# cultivar field - empty string or None if there isn't one
cultivar_field = "Cultivar"
cultivar_author_field = "CultivarAuthorName"

# mapping of dataset property fields (keys) to taxon table fields (values)
# these are the properties that will be kept from the dataset, anything else will be discarded
# note the fields on the left (keys) are not case sensitive but those on the right (values) are...
mapping = {
  "text1": "TaxStatus",
  "text2": "Genno",
  "text3": "Wfoid", 
  "text4": "IUCN",
  # "text5": "TOPS", # excluded because we don't have this currently
  "citesStatus": "Cites",
  "cultivarName": "Cultivar",
  "text6": "CultivarAuthorName", #NB: This has been hard coded in buildTreeFromFile in lieu of having the dedicated field in Specify, update there if it changes

  # hidden fields for managing taxon backbone sync 
  "text10": "GUID", # we need to use this field so we can index it
  "text11": "SynOfGUID", # we need to use this field so we can index it
  "text9": "CalcFullName",
}

#this looks redundant but we need it...
recordGUIDField = 'text10'
acceptedNameRecordGUIDField = 'text11'

# the credentials for accessing the database
credentials = {
  "user": "root",
  "password": "root",
  "host": "localhost",
  "database": "bodatsa_taxa"
}

# the admin username to reflect as having added the taxa. They must be a manager (old Specify roles)
username = 'ian'

### SCRIPT, do not edit...

print('connecting to database...')
try:
  cnx = getDatabaseConnection(credentials)
except Exception as ex:
  print(str(ex))
  exit()

### verify the user
print('verifying user', username)
try:
  spuserid = getSpecifyUserID(cnx, username)
except Exception as ex:
  print(str(ex))
  exit()


### get the taxontreedefitems for the discipline
print('getting treedef items')
sys.stdout.write('\033[?25l') #to clear the console cursor for printing progress
sys.stdout.flush()
try:
  treedefitems = getTreedefItems(cnx, sp_discipline)
except Exception as ex:
  print(str(ex))
  exit() 

print('building taxon tree from file, this may take a few moments...')
start_time_tree = time.perf_counter()
try:
  tree = buildTreeFromFile(fileDir, sourceFile, mapping, root_taxon, taxon_field_indexes, treedefitems,cultivar_field, cultivar_author_field, spuserid)
except Exception as ex:
  print("Something went wrong:", str(ex))
  exit()

sys.stdout.write('\033[?25h') #resetting the console cursor
sys.stdout.flush()

end_time_tree = time.perf_counter()
seconds = (end_time_tree - start_time_tree) % (24 * 3600)
hour = seconds // 3600
seconds %= 3600
minutes = seconds // 60
seconds %= 60
print("Tree built with", len(tree.nodes), "nodes in", "%02dh:%02dm:%02ds" % (hour, minutes, seconds)) 


print('adding records to database')
total = len(tree.all_nodes())
bar = Bar('Processing', max=len(tree.nodes))
start_time_db = time.perf_counter()
try:
  addToDatabase(cnx, tree, tree.get_node(tree.root), bar)
except Exception as ex:
  bar.finish()
  cnx.rollback()
  cnx.close()
  print(str(ex))
  exit()

bar.finish()
cnx.commit()

### we have to update the node numbers because this was an insertion
### note this updates for the whole tree so may 
print('updating tree node numbers')
try:
  updates = updateTreeNodeNumbers(cnx, treedefitems[0]["treedefid"])
except Exception as ex:
  print('Oops!', str(ex))
  cnx.rollback
  cnx.close()
  exit()
  
cnx.commit()
print('node numbers were updated for', updates, 'records')
  
### update the acceptedIDs
print('updating synonyms')
print('checking field indexes')
indexesAdded = addFieldIndex(cnx, credentials["database"], 'taxon', recordGUIDField, acceptedNameRecordGUIDField)
if len(indexesAdded):
  print('indexes added for', ', '.join(indexesAdded))

update_count = updateAcceptedTaxa(cnx, treedefitems[0]['treedefid'], recordGUIDField, acceptedNameRecordGUIDField)
print('synonyms updated for', update_count, 'records')

cnx.commit()
cnx.close()

end_time_db = time.perf_counter()
seconds = (end_time_db - start_time_db) % (24 * 3600)
hours = seconds // 3600
seconds %= 3600
minutes = seconds // 60
seconds %= 60
  
print("Database updated in", "%02dh:%02dm:%02ds" % (hours, minutes, seconds)) 

print('Congratulations, the import is complete')