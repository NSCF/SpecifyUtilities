//takes a file with unique species/taxon names and gets the authorities from globalnames or gbif
//skips any that already have authority data
//outputs the original file with the authorities added

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import fetch from 'node-fetch';
import {fetchGBIFTaxon} from '../utils/getGBIFTaxon.js'

const csvPath = String.raw`D:\NSCF Data WG\Specify migration\ARC PHP\NCA`
const csvFile = String.raw`NCA-taxa-20220615-OpenRefine.csv` //the full file path and name
const fullNameField = 'FullName'
const authorField ='authority'
const restrictToRank = 'kingdom'
const restrictToName = 'Animalia'

const records = []
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

    if(!row.hasOwnProperty(authorField)) {
      console.error(`The field '${authorField}' does not exist in the dataset, please fix'`)
      process.exit()
    }

    if(row[fullNameField] && row[fullNameField].trim()) {
      if(!row[authorField] || !row[authorField].trim()) { //filter out any that already have author data
        row[authorField] = null //just to make sure...
        row.authoritySource = null
        taxa[row[fullNameField].trim()] = false //used again later when adding the updated values
      }
    }

    records.push(row) //save for later

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

    const url = `https://verifier.globalnames.org/api/v1/verifications`
    const callBody = {
      nameStrings: taxonNames,
      preferredSources: [1],
      withAllMatches: false,
      withCapitalization: false
    }
    
    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(callBody)
      })
    }
    catch(err) {
      console.error('error calling globalnames:', err.message)
      process.exit()
    }
      
    let results
    try {
      results = await response.json() // this is an array
    }
    catch(err) {
      console.error('error parsing json:', err.message)
      process.exit()
    }

    for (const result of results) {
      if(result.bestResult && result.bestResult.classificationRanks && result.bestResult.classificationPath) {
        const ranks = result.bestResult.classificationRanks.split('|')
        const names = result.bestResult.classificationPath.split('|')

        //we only want valid results, so make a classification object
        const classification = {}
        while(ranks.length && names.length) {
          const rank = ranks.pop()
          const name = names.pop()
          classification[rank.toLowerCase()] = name
        }

        if(classification[restrictToRank] && classification[restrictToRank] == restrictToName){
          //we have to extract the author
          if(taxa.hasOwnProperty(result.bestResult.matchedCanonicalSimple)){ //check that we have a match
            const author = result.bestResult.matchedName.replace(result.bestResult.matchedCanonicalSimple, '').trim()
            if(author) {
              const resultObject = {[authorField]: author, authoritySource: result.bestResult.dataSourceTitleShort}
              taxa[result.bestResult.matchedCanonicalSimple]= resultObject
            }
          }
        }
      }
    }

    //if any still missing try GBIF
    let noAuthors = Object.entries(taxa).filter(([taxon, result]) => result != false).map(([taxon, result]) => taxon)
    
    const authorsFromGlobalNames = Object.keys(taxa).length - noAuthors.length
    if(authorsFromGlobalNames > 0){
      console.log('Successfully fetched', authorsFromGlobalNames, 'authorities from GlobalNames')
    }
    else {
      console.log('Got no authorities from GlobalNames')
    }
    
    if(noAuthors.length){
      console.log('Attempting GBIF for remaining', noAuthors.length, 'names needing authorities')

      let proms = []
      for (const record of noAuthors) {
        proms.push(fetchGBIFTaxon(record[fullNameField], restrictToRank, restrictToName))
      }
      
      let gbifResults
      try{
        gbifResults = await Promise.all(proms)
      }
      catch(err) {
        console.error('failed to get results from gbif with error:', err.message)
      }
      
      let gbifAuthorityCount = 0
      if(gbifResults) {
        for (const result of gbifResults) {
          if(result.taxon && result.taxon.authorship && result.taxon.authorship.trim()) {
            const resultObject = {[authorField]: result.taxon.authorship.trim(), authoritySource: 'GBIF'}
            taxa[result.name] = resultObject
            gbifAuthorityCount++
          }
        }
      }

      if(gbifAuthorityCount > 0) {
        console.log('Got', gbifAuthorityCount, 'authorities from GBIF')
      }
      else {
        console.log('Attempt to fetch authorities from GBIF unsuccessful')
      }
    }

    //put the values back in the dataset
    for (const record of records) {
      let result = taxa[record[fullNameField].trim()]
      if(result){
        Object.assign(record, result)
      }
    }

    console.log('Writing out results for', records.length, 'records...')
    csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_authorites-added.csv')), records, {headers:true})
    .on('error', err => console.error('error writing file:', err.message))
    .on('finish', () => console.log('All done!'));

  })