from funcs import addNodeNumbers
from treelib import Node, Tree

tree = Tree()
root = tree.create_node("Harry", "harry", data={})  # root node
tree.create_node("Jane", "jane", parent="harry", data={})
tree.create_node("Bill", "bill", parent="harry", data={})
tree.create_node("Diane", "diane", parent="jane", data={})
tree.create_node("Mary", "mary", parent="diane", data={})
tree.create_node("Mark", "mark", parent="jane", data={})

highest = addNodeNumbers(tree, root, 0)
i = 0





