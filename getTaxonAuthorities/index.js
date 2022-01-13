//takes a file with unique species names and gets the authorities from globalnames or gbif

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import fetch from 'node-fetch';
import {fetchGBIFTaxon} from '../utils/getGBIFTaxon.js'

const csvPath = String.raw`./`
const csvFile = String.raw`elm_malacology_taxa_withAuthors.csv` //the full file path and name
const fullNameField = 'fullname'
const authorField ='suggestedAuthor'
const restrictToRank = 'kingdom'
const restrictToName = 'Animalia'

const records = {}
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

    if(row[fullNameField] && row[fullNameField].trim()) {
      if(!(row[authorField] && row[authorField].trim())) { //filter out any that already have author data
        row[authorField] = null //just to make sure...
        row.source = null
        records[row[fullNameField]] = row
      }
      
    }
    
  })
  .on('end', async rowCount => {

    if(!Object.values(records).length){
      console.log('no records read from file, please check')
      console.log('exiting...')
      process.exit()
    }

    console.log(rowCount, 'rows read from file with', Object.values(records).length, 'valid data entries')
    
    //try globalnames first
    console.log('fetching data from GlobalNames')
    const taxonNames = Object.values(records).map(x => x[fullNameField])

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

        //make a classification object
        const classification = {}
        while(ranks.length && names.length) {
          const rank = ranks.pop()
          const name = names.pop()
          classification[rank.toLowerCase()] = name
        }

        if(classification[restrictToRank] && classification[restrictToRank] == restrictToName){
          //we have to extract the author
          if(records.hasOwnProperty(result.bestResult.matchedCanonicalSimple)){ //check that we have a match
            const author = result.bestResult.matchedName.replace(result.bestResult.matchedCanonicalSimple, '').trim()
            if(author) {
              records[result.bestResult.matchedCanonicalSimple][authorField] = author
              records[result.bestResult.matchedCanonicalSimple].source = result.bestResult.dataSourceTitleShort
            }
          }
        }
      }
    }

    //if any still missing try GBIF
    const noAuthors = Object.values(records).filter(x => x[authorField] == null)
    if(noAuthors.length){
      console.log('No authorities found for', noAuthors.length, 'names, attempting GBIF...')

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
      
      if(gbifResults) {
        for (const result of gbifResults) {
          if(result.taxon && result.taxon.authorship && result.taxon.authorship.trim()) {
            records[result.name][authorField] = result.taxon.authorship.trim()
          }
        }
      }
    }

    const withAuthors = Object.values(records).filter(x => x[authorField] != null)
    console.log('authorities found for', withAuthors.length, 'of', Object.values(records).length, 'records')
    console.log('saving to file...')
    csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_authorites.csv')), Object.values(records), {headers:true})
    .on('error', err => console.error('error writing file:', err.message))
    .on('finish', () => console.log('All done!'));


  })