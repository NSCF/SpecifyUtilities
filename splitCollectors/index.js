import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import splitCollectors from "./splitCollectors.js";

const csvPath = String.raw`D:\NSCF Data WG\Specify migration\ARC PHP\NCA\SPECIFY\DATA`
const csvFile = String.raw`NCA-data-export-20220901_OpenRefine_ie-edits20240313_coll1234Added.csv`
const collectorsOrDeterminer = 'collectors' //are we splitting collectors for det by, used only to name the output file
const agentField = 'Collector 5'
const institutionField = null

//NOTE WE CANNOT HAVE MIXED INSTITUTIONS AND PEOPLE IN THE COLLECTORS FIELD. THIS ASSUMES THAT IF THERE IS AN INSTITUTION, IT APPLIES TO ALL COLLECTORS

const records = []
console.log('reading file...')
fs.createReadStream(path.join(csvPath, csvFile))
    .pipe(csv.parse({ headers: true }))
    .on('error', error => console.error(error))
    .on('data', row => {
      row.collectorsArray = splitCollectors(row[agentField])

      
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
      console.log(`read ${rowCount} rows`)
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
      console.log('writing new file...')
      csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', `_${collectorsOrDeterminer}FieldsAdded.csv`)), records, {headers:true})
      .on('error', err => console.error('error writing file:', err.message))
      .on('finish', () => console.log('All done!'));

    });