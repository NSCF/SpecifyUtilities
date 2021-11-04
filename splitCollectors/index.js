import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import splitCollectors from "./splitCollectors.js";

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data`
const csvFile = String.raw`Collectors-edited-OVR-Open-Refine.csv` //the full file path and name
const collectorField = 'Collector edited'
const institutionField = 'Institution'

//NOTE WE CANNOT HAVE MIXED INSTITUTIONS AND PEOPLE IN THE COLLECTORS FIELD. THIS ASSUMES THAT IF THERE IS AN INSTITUTION, IT APPLIES TO ALL COLLECTORS

const records = []
fs.createReadStream(path.join(csvPath, csvFile))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
      row.collectorsArray = splitCollectors(row[collectorField])

      //NB we add the institution to all collectors!
      if(row[institutionField] && row[institutionField].trim()) {
        if(row.collectorsArray.length) {
          for (let coll of row.collectorsArray) {
            coll.institution = row[institutionField].trim()
          }
          row[institutionField] = null //The institution is now recorded for each collector
        }
      }
      records.push(row)
    })
    .on('end', rowCount => {
      console.log(`Parsed ${rowCount} rows from file`)
      const collectorCounts = records.map(x => x.collectorsArray.length) 
      const maxCollectorCount = Math.max.apply(null, collectorCounts);

      //add all the fields...
      const fields = ['title', 'firstName',  'lastName', 'initials', 'institution']
      for (const record of records) {
        for (let i = 0; i < maxCollectorCount; i++) {
          let collector = record.collectorsArray[i]
          for(let field of fields) {
            const newFieldName = field + (i + 1)
            if(collector) {
              record[newFieldName] = collector[field]
            }
            else {
              record[newFieldName] = null
            } 
          }
        }
        delete record.collectorsArray
      }

      //and write it out again
      csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_fieldsAdded.csv')), records, {headers:true})
      .on('error', err => console.error('error writing file:', err.message))
      .on('finish', () => console.log('All done!'));

    });