//takes a file with unique species/taxon names and gets the authorities from globalnames or gbif
//skips any that already have authority data
//outputs the original file with the authorities and the source added

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import { getGlobalNamesTaxa } from '../utils/taxonNameServices.js'

const csvPath = String.raw`D:\NSCF Data WG\Specify migration\NICD`
const csvFile = String.raw`NICD-mosquitos-TaxonomyExtract-Nov2022-OpenRefine-authorites+acceptednames_OpenRefine.csv` //the full file path and name
const fullNameField = 'CANONICAL_NAME'
const authorField = 'globalnamesAuthority' //can be an existing or a new field


const records = {}
const taxa = {}
fs.createReadStream(path.resolve(path.join(csvPath, csvFile)))
  .pipe(csv.parse({ headers: true }))
  .on('error', err => {
    console.log('error reading file:', err.message)
    process.exit()
  })
  .on('data', row => {

    if(!row.hasOwnProperty(fullNameField)) {
      console.error(`The field '${fullNameField}' does not exist in the dataset, please fix'`)
      process.exit()
    }

    //prepare the author field
    if (!row.hasOwnProperty(authorField)) {
      row[authorField] = null
    }
    else {
      if(!row[authorField] || !row[authorField].trim()) { //no author
        row[authorField] = null
      }
    }

    // records with no taxon name are removed...
    if(row[fullNameField] && row[fullNameField].trim()) {
      
      if(taxa.hasOwnProperty(row[fullNameField].trim())){
        console.error('The dataset provided has duplicate taxon names, please fix and retry')
        process.exit()
      }

      row.authoritySource = null
      row.similar = null
      row.acceptedName = null

      if(!row[authorField]){
        taxa[row[fullNameField].trim()] = false //used again later when adding the updated values
      }

      records[row[fullNameField].trim()] = row

    }

  })
  .on('end', async rowCount => {

    if(!Object.values(taxa).length){
      console.log('no records read from file, please check')
      console.log('exiting...')
      process.exit()
    }

    console.log(rowCount, 'rows read from data file with', Object.values(taxa).length, 'taxon names lacking authorities')
    
    //try globalnames first
    console.log('fetching data from GlobalNames')
    const taxonNames = Object.keys(taxa)

    const globalnamesResults = await getGlobalNamesTaxa(taxonNames)

    const notFound = []
    let authorsFromGlobalNames = 0
    for (let [taxonName, row] of Object.entries(records)){
      if(globalnamesResults.hasOwnProperty(taxonName)){
        
        const globalnamesRecord = globalnamesResults[taxonName]

        //add similar name
        if (globalnamesRecord.matchedCanonicalSimple != taxonName) { //globalnames uses fuzzy matches
          row.similar = globalnamesRecord.matchedName
          continue
        }

        //add the authority
        const nameLastPart = taxonName.split(' ').filter(x => x).pop()
        const matchedNameParts = globalnamesRecord.matchedName.split(' ').filter(x => x)
        const indexOfLastNamePart = matchedNameParts.lastIndexOf(nameLastPart)
        if (indexOfLastNamePart >= 0 && matchedNameParts.length > indexOfLastNamePart) {
          row[authorField] = matchedNameParts.slice(indexOfLastNamePart + 1).join(' ')
          authorsFromGlobalNames++
        }

        //add current name
        row.acceptedName = globalnamesRecord.currentName
        row.authoritySource = 'globalnames'

      }
      else {
        notFound.push(taxonName)
      }
      
    }

    if(authorsFromGlobalNames > 0){
      console.log('Successfully fetched', authorsFromGlobalNames, 'authorities from GlobalNames')
      console.log('Writing out results...')
      csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_authorites+acceptednames.csv')), Object.values(records), { headers:true })
      .on('error', err => console.error('error writing file:', err.message))
      .on('finish', () => console.log('All done!'));
    }
    else {
      console.log('Got no authorities from GlobalNames')
    }

  })