//takes a dataset of taxon names and returns those not in the Specify taxon backbone

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'
import onlyUnique from '../utils/onlyUnique.js';

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data\final edits`
const csvFile = String.raw`NCAH-Secondary-collection-edited-20220805-OpenRefine-StorageUpdates-collectorsFieldsAdded-OpenRefine.csv`

const taxonNameField = 'DetTaxon'

let conn
try {
  conn = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'specifyovr'
  });
}
catch(err){
  console.error(err)
  process.exit()
}

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
    let uniqueNames = allNames.filter(onlyUnique)
    console.log('successfully read', rowCount, 'records from file with ', uniqueNames.length, ' unique names, checking database...')

    const missingNames = []
    const namesPresent = []
    for(const taxonName of uniqueNames) {

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

      missingNames.sort()
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

async function checkNameInDatabase(conn, name, discipline) {
  
  const nameParts = name.split(/\s+/)

  while (nameParts.length > 0) {
    let searchName = nameParts.join(' ')
    let found = await getNameFromDatabase(conn, searchName, discipline)
    
    if (found) {
      return true
    }
    else {
      nameParts.pop()
    }
  }

  //if we get here we haven't found the name...
  return false

}

function getNameFromDatabase (conn, searchName, discipline) {
  return new Promise((resolve, reject) => {
    const sql = `select * from taxon t
    join taxontreedef ttd on t.taxontreedefid = ttd.taxontreedefid
    join discipline d on d.taxontreedefID = ttd.taxontreedefID
    where t.fullname = '${searchName}' and d.name = '${discipline}'`

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