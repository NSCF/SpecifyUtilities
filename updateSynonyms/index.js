//takes a file with two columns, first is old name, second is current name, and updates in the Specify taxon backbone

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data`
const csvFile = String.raw`Recapture-of-accession-data-NCAH-Historical-collection-13-05-2020-Specify-edited.csv` //the full file path and name

const originalNameField = 'original'
const currentNameField = 'current'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'me',
  password : 'secret',
  database : 'dnsm'
});

const specifyDiscipline = 'Herpetology'

const records = []
fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    if(!row.hasOwnProperty(originalNameField) || !row.hasOwnProperty(currentNameField)) {
      console.error('missing name fields for record, please fix input file first')
      process.exit()
    }
    //else
    records.push(row)
  })
  .on('end', async rowCount => {
    console.log('successfully read', rowCount, 'from file, making updates...')

    conn.connect();
    for(const record of records) {
      const originalName = record[originalNameField]
      const currentName = record[currentNameField]
    }
  })