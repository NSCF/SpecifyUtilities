import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import splitCollectors from "./splitCollectors.js";

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data`
const csvFile = String.raw`NCAH-Type-collection-Specify-edited-ie_check.csv` //the full file path and name
const collectorField = 'Collector edited'
const institutionField = 'Collecting_institution'

//NOTE WE CANNOT HAVE MIXED INSTITUTIONS AND PEOPLE IN THE COLLECTORS FIELD. THIS ASSUMES THAT IF THERE IS AN INSTITUTION, IT APPLIES TO ALL COLLECTORS

const records = []
fs.createReadStream(path.join(csvPath, csvFile))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
      row.collectorsArray = splitCollectors(row[collectorField])

      
      if(row.hasOwnProperty(institutionField)) { //the field exists
        if (row[institutionField] && row[institutionField].trim()) { //it has a value
          if(row.collectorsArray.length) { //if there are collectors we add the institution to all collectors as an address
            for (let coll of row.collectorsArray) {
              coll.institution = row[institutionField].trim()
            }
          }
          else {
            //we need to add one for just the institution
            const coll = {
              title: null,
              firstName: null,
              lastName: row[institutionField], //specify stores institution names in the lastName field when agents are institutions
              initials: null, 
              institution: null
            }
            row.collectorsArray.push(coll)
          }
        }
        delete row[institutionField]
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