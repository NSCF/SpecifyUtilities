//reads a csv file, gets all unique values from a target field, and fetches higher classification from GlobalNames and GBIF
//if GlobalNames (which provides more comprehensive classification) failes, then falls back to GBIF
//assumes the first entry from GBIF has adequate higher classification
//creates a new file with the taxon names only
//remember to double check manually afterwards just in case any funny things crept in...

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import fetch from 'node-fetch';

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data`
const csvFile = String.raw`NCAH-Type-collection-Specify-edited-ie_check_fieldsAdded.csv` //the full file path and name
const targetField = 'PARGENUS_edited'
const restrictToRank = 'kingdom'
const restrictToName = 'Animalia'
const targetRanks = ['phylum', 'class', 'subclass', 'order', 'suborder', 'superfamily', 'family', 'subfamily'] //the ranks we want, note the rank we're searching on is added as 'name'

const names = {}
fs.createReadStream(path.join(csvPath, csvFile))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {

      //exit if we don't have this field
      if(!row.hasOwnProperty(targetField)) {
        console.error(`The field '${targetField}' does not exist in the dataset'`)
        process.exit()
      }

      //if we have species and subspecies we want to get the genera as well...

      if(!names.hasOwnProperty(row[targetField])){
        names[row[targetField]] = true
      }
    })
    .on('end', async rowCount => {
      const uniqueNames = Object.keys(names)
      if(uniqueNames.length == 0) {
        console.error('No names found, exiting...')
        process.exit()
      }
      //else

      console.log('successfully read', rowCount, 'records with ', uniqueNames.length, 'unique names')


      //try globalnames first
      console.log('fetching data from GlobalNames')

      let namesFound = 0
      let notFound = [] //for nothing returned and those with no classification
      

      const url = `https://verifier.globalnames.org/api/v1/verifications`
      const callBody = {
        nameStrings: uniqueNames,
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

      const output = []
      for (const result of results) {
        if(result.bestResult) {
          if(result.bestResult.classificationRanks && result.bestResult.classificationPath){
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
              
              const outputObj = {}
              
              for (const targetRank of targetRanks) {
                outputObj[targetRank] = classification[targetRank] || null
              }

              outputObj.name= result.input

              output.push(outputObj)
              namesFound++

            }
            else {
              notFound.push(result.input)
            }
          }
          else{
            notFound.push(result.input)
          }
        }
        else {
          notFound.push(result.input)
        }
      }

      console.log('Found matches for', namesFound, 'names in GlobalNames')

      if(notFound.length){
        console.log('No matches for', notFound.length, 'names, attempting GBIF...')
        namesFound = 0

        let proms = []
        for (const name of notFound) {
          proms.push(fetchGBIFTaxon(name, restrictToRank, restrictToName))
        }

        let gbifResults = await Promise.all(proms)

        const stillNotFound = []
        for (const result of gbifResults) {
          if(result.taxon) {
            const outputObj = {}
              
            for (const targetRank of targetRanks) {
              outputObj[targetRank] = result[targetRank] && result[targetRank].trim() ?  result[targetRank].trim() : null
            }

            if(outputObj[targetRanks[0]]) {
              outputObj.name= result.name
              output.push(outputObj)
              namesFound++
            }
            else{
              stillNotFound.push(result.name)
            }
            
          }
          else {
            stillNotFound.push(result.name)
          }
        }

        if(namesFound) {
          console.log('Another', namesFound, 'names found in GBIF')
        }

        if(stillNotFound.length) {
          console.log(stillNotFound.length, 'names not found on GBIF either:')
          console.log(stillNotFound.join('|'))
        }
      }

      console.log('saving to file...')
      csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_higherClass.csv')), output, {headers:true})
      .on('error', err => console.error('error writing file:', err.message))
      .on('finish', () => console.log('All done!'));
    })


const fetchGBIFTaxon = async (name, restrictToRank, restrictToName) => {
  const url = `https://api.gbif.org/v1/species?name=${name}`
  const response = await fetch(url)
  const json = await response.json()
  if(json.hasOwnProperty('results') && Array.isArray(json.results) && json.results.length){
    const candidates = json.results.filter(x => x.hasOwnProperty(restrictToRank) && x[restrictToRank] == restrictToName)
    if(candidates.length) {
      const taxon = candidates[0]
      return {name, taxon}
    }
    else {
      return {name, taxon: null}
    }
  }
  else {
    return {name, taxon: null}
  }
}