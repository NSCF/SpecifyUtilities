//validates coordinates text fields by attempting to convert them to decimals and reports any errors

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import convert from 'geo-coordinates-parser'

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data\final edits`
const csvFile = String.raw`NCAH-Secondary-collection-edited-20220805-OpenRefine-StorageUpdates-collectorsFieldsAdded-OpenRefine.csv` //the full file path and name
const recordIdentifierField = 'NCAH no.'
const latitudeField = 'VerbatimLat'
const longitudeField = 'VerbatimLong'
const coordsField = null

const errorRecords = []
let missingIdentifiers = 0
fs.createReadStream(path.join(csvPath, csvFile))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {

      if (!row.hasOwnProperty(recordIdentifierField)){
        console.error('The dataset does not have an identifier field named', recordIdentifierField)
        console.log('Please check the fields and try again...')
        console.log('Bye...')
        process.exit()
      }

      //check the fields exist
      if (!row.hasOwnProperty(coordsField)) {
        if (!row.hasOwnProperty(latitudeField) || !row.hasOwnProperty(longitudeField)) {
          console.error('The dataset does not contain the specified coordinates fields. Please check the field names and try again')
          console.log('Bye...')
          process.exit()
        }
      }

      const identifier = row[recordIdentifierField]

      if (identifier == null || identifier.trim() == "") {
        missingIdentifiers++
        return
      }

      if (!row.hasOwnProperty(coordsField)) {
        
        const coords = [row[latitudeField], row[longitudeField]].filter(x => x).map(x => x.trim()).filter(x => x) //remove blanks, should be two values or none...
        
        if (coords.length == 0){
          return //no coords for this record
        }

        if (coords.length == 1) { //one coordinate is missing...
          errorRecords.push(identifier)
          return
        }

        try {
          convert(coords.join(' '))
        }
        catch(err) {
          errorRecords.push(identifier) //they didn't convert, they need to be checked
          return
        }
      }
      else {
        const coords = row[coordsField]
        if( coords != null && coords.trim() != ''){ //we have coords
          try {
            convert(coords.join(' '))
          }
          catch {
            errorRecords.push(identifier) //they didn't convert, they need to be checked
            return
          }
        }
        else {
          return
        }
      }
    })
    .on('end', rowCount => {
      console.log('Parsed', rowCount, 'from file')

      if(missingIdentifiers == 1) {
        console.log('One record has no identifier value, the coordinates were not checked...')
      }

      if(missingIdentifiers > 1) {
        console.log(missingIdentifiers, 'records have no identifier values, their coordinates were not checked...')
      }

      if(errorRecords.length > 0) {
        errorRecords.sort()
        console.log('There are errors with the coordinates in the following records:')
        console.log(errorRecords.join('|'))
      }

      console.log('all done...')

    });