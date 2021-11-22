//takes a dataset of taxon names and returns those not in the Specify taxon backbone

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Herp specimen digitization\HerpSpecimenData\Durban Herp Specimen Data`
const csvFile = String.raw`DNSM_WB_taxon_upload1.csv`

const taxonNameField = 'name'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'dnsm'
});

const specifyDiscipline = 'Herpetology'

const missingNames = {}
const namesPresent = {}
const allNames = []
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
    console.log('successfully read', rowCount, 'records from file, checking database...')

    for(const taxonName of allNames) {

      if(!missingNames.hasOwnProperty(taxonName) && !namesPresent.hasOwnProperty(taxonName)) {
        try {
          const hasTaxonName = await checkNameInDatabase(conn, taxonName, specifyDiscipline)
          if(hasTaxonName) {
            namesPresent[taxonName] = true
          }
          else {
            missingNames[taxonName] = true
          }
        }
        catch(err) {
          console.error('error calling database', err.message)
          process.exit()
        }
      }
    }

    const namesInDB = Object.keys(namesPresent)
    console.log(namesInDB.length, 'names already in the database')

    const namesToWrite = Object.keys(missingNames)
    if(namesToWrite.length) {
      console.log(namesToWrite.length, 'missing names')
      console.log('writing to file...')

      const output = namesToWrite.map(name => ({[taxonNameField]: name}))

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
        join discipline d on d.taxontreedefID = t.taxontreedefID
        where fullname = '${name}' and d.name = '${discipline}'`
      conn.query(sql, function (error, results, fields) {
        if(error) {
          reject(error)
        }
        //else
        if(results && results.length) {
          resolve(true)
        }
        else {
          resolve(false)
        }
      })
    })
  }