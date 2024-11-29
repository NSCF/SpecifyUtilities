// reads a csv of taxon names and their higher classification and finds cases where lower ranks appear under more
// than one parent, e.g. a genus names is classified under different familities. 
// This happens easily when taxa are recorded in spreadsheets, and the higher classification changes over time. 

import { readCSV } from '../utils/readCSV.js'
import { writeCSV } from '../utils/writeCSV.js'

const fileName = String.raw`NCA-taxa-20220615-OpenRefine_authorites-added_classificationAdded-OpenRefine.csv`
const fileDir = String.raw`D:\NSCF Data WG\Specify migration\ARC PHP\NCA`

//case insenstitive list of fields to check
const rankFields =  [
  'arachorder',
  'suborder',
  'infraorder', 
  'superfamily', 
  'family', 
  'subfamily',
  'genus', 
  'subgenus', 
  'fullname'
]

/////////////// SCRIPT //////////////
console.log('reading taxon file...')
const records = await readCSV(fileDir, fileName)

const keys = []
const notFound = []

const recordKeys = Object.keys(records[0])
for (const rank of rankFields) {
  const matchingKey = recordKeys.find(x => x.toLowerCase().trim() == rank.toLowerCase().trim())
  if (matchingKey) {
    keys.push(matchingKey)
  }
  else {
    notFound.push(rank)
  }
}

if (notFound.length) {
  console.error('The following fields do not exist in the dataset:', notFound.join('; '))
  console.log('please fix and try again...')
  process.exit()
}

//process the records from the last rank to the first
console.log('checking higher classification...')
const duplicates = [] // to store taxa which appear under multiple ranks
keys.reverse()
for (const [index, rank] of keys.entries()) {

  // we stop if we've reached the end
  if (index == keys.length - 1) {
    break
  }

  const taxonParents = {}
  for (const record of records) {
    const taxon = record[rank]
    
    //handle blanks
    if (!taxon) {
      continue
    }

    //get the parent, noting there can be empty fields
    let parent = null
    let checkIndex = index + 1
    while (!parent){
      parent = record[keys[checkIndex]]
      checkIndex++
    }

    if (taxon in taxonParents) {
      taxonParents[taxon].add(parent)
    }
    else {
      taxonParents[taxon] = new Set([parent])
    }
  }

  for (const [taxon, parents] of Object.entries(taxonParents)) {
    if (parents.size > 1) {
      duplicates.push(
        {
          taxon, 
          'parents': Array.from(parents).join(' | ')
        }
      )
    }
  }

}

if (duplicates.length > 0) {
  console.log('There are', duplicates.length, 'taxa with multiple parents.')
  console.log('Writing to file...')

  const newFileName = fileName.replace(/\.csv$/i, '_inconsistencies.csv')
  await writeCSV(fileDir, newFileName, duplicates)
  console.log('all done!')
}
else {
  console.log('All taxa have only one parent in this dataset. Congratulations...')
}


