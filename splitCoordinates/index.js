//splits a single field with coordinates into two fields

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import convert from 'geo-coordinates-parser'

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ESI Palaeo`
let csvFile = String.raw`ESI-Karoo2006a-sorted-2022-02-03_ie_check_coordsSplit` //the full file path and name
const coordinatesField = 'Co-ordinates edited'

//SCRIPT

if(!/\.csv$/i.test(csvFile)) {
  csvFile = csvFile += '.csv'
}

const records = []
let splits = 0
let errors = 0
fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {

    //check we have the field!
    if(!row.hasOwnProperty(coordinatesField)) {
      console.error('coordinates field', coordinatesField, 'does not exist in dataset')
      console.log('exiting...')
      process.exit()
    }

    //add the fields
    if(!row.hasOwnProperty('verbatimLat')){
      row.verbatimLat = null
      row.verbatimLong = null
      row.coordsParseError = null
    }
    
    if(row[coordinatesField] && row[coordinatesField].trim()) {
      try {
        const converted = convert(row[coordinatesField].trim())
        row.verbatimLat = converted.verbatimLatitude
        row.verbatimLong = converted.verbatimLongitude
        splits++
      }
      catch(err) {
        row.coordsParseError = err.message
        errors++
      }
    }

    records.push(row)
  })
  .on('end', rowCount => {
    console.log('read', rowCount, 'records from the file')
    console.log(splits + errors, 'with coordinates')
    console.log(splits, 'successfully split and', errors, 'with errors')
    console.log('writing out results...')
    csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_coordsSplit.csv')), records, {headers:true})
    .on('error', err => console.error('error writing file:', err.message))
    .on('finish', () => console.log('All done!'));
    
  })
