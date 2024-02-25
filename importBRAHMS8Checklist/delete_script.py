# delete a (sub)tree from Specify
import time
from funcs import getDatabaseConnection, getTreedefItems, buildTreeFromDatabase, deleteFromDatabase, updateTreeNodeNumbers
from progress.bar import Bar

sp_discipline = "botany"
root_taxon = 'life' #the root of the (sub)tree to delete

credentials = {
  "user": "root",
  "password": "root",
  "host": "localhost",
  "database": "bodatsa_taxa"
}

print('connecting to database')
cnx = getDatabaseConnection(credentials)

print('building tree')
treedefItems = getTreedefItems(cnx, sp_discipline)
try:
  tree = buildTreeFromDatabase(cnx, treedefItems[0]['treedefid'], root_taxon, ['fullname'])
except Exception as ex:
  print(str(ex))
  exit()

print('deleting', root_taxon, 'from database')
start_time_db = time.perf_counter()
bar = Bar('Processing', max=len(tree.nodes))
delete_count = deleteFromDatabase(cnx, tree, bar)
bar.finish()

print('Updating tree node numbers')
updateTreeNodeNumbers(cnx, treedefItems[0]['treedefid'])

end_time_db = time.perf_counter()

seconds = (end_time_db - start_time_db) % (24 * 3600)
hours = seconds // 3600
seconds %= 3600
minutes = seconds // 60
seconds %= 60
  
print(delete_count, "records deleted in", "%02dh:%02dm:%02ds" % (hours, minutes, seconds)) 

cnx.close()
print('all done!')

