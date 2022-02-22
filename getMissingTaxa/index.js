//takes a dataset of taxon names and returns those not in the Specify taxon backbone

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'
import onlyUnique from '../utils/onlyUnique.js';

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data\final edits`
const csvFile = String.raw`NCAH-RE7E06-2022-01-28 host taxon edited.csv`

const taxonNameField = 'Host taxon updated'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'specifyovr'
});

const specifyDiscipline = 'Collections'

let allNames = []
fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    if(!row.hasOwnProperty(taxonNameField)) {
      console.error('missing name field, please fix input file first')
      process.exit()
    }
    //else
    let taxonName = row[taxonNameField]
    if(taxonName && taxonName.trim()) {
      allNames.push(taxonName.trim())
    }
  })
  .on('end', async rowCount => {
    allNames = allNames.filter(onlyUnique)
    console.log('successfully read', rowCount, 'records from file with ', allNames.length, ' unique names, checking database...')

    const missingNames = []
    const namesPresent = []
    for(const taxonName of allNames) {

      try {
        const hasTaxonName = await checkNameInDatabase(conn, taxonName, specifyDiscipline)
        if(hasTaxonName) {
          namesPresent.push(taxonName)
        }
        else {
          missingNames.push(taxonName)
        }
      }
      catch(err) {
        console.error('error calling database', err.message)
        process.exit()
      }
    }

    console.log(namesPresent.length, 'names already in the database')

    if(missingNames.length) {
      console.log(missingNames.length, 'missing names')
      console.log('writing to file...')

      const output = missingNames.map(name => ({[taxonNameField]: name}))

      csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_missingNames.csv')), output, {headers:true})
        .on('error', err => console.error('error writing file:', err.message))
        .on('finish', () => {
          console.log('All done!')
          process.exit()
        });
    }
    else {
      console.log('No missing names, all done...')
      process.exit()
    }    
  })

 function checkNameInDatabase(conn, name, discipline) {
    return new Promise((resolve, reject) => {
      const sql = `select * from taxon t
        join taxontreedef ttd on t.taxontreedefid = ttd.taxontreedefid
        join discipline d on d.taxontreedefID = ttd.taxontreedefID
        where t.fullname = '${name}' and d.name = '${discipline}'`
      conn.query(sql, (error, results, fields) => {
        if(error) {
          reject(error)
        }
        //else
        if(results && results.length > 0) {
          resolve(true)
        }
        else {
          resolve(false)
        }
      })
    })
  }