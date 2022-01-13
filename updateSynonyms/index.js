//takes a file with two columns, first is old name, second is current name, and updates in the Specify taxon backbone

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Herp specimen digitization\HerpSpecimenData\Durban Herp Specimen Data`
const csvFile = String.raw`DNSM_reptiles_synonyms.csv` //the full file path and name

const originalNameField = 'taxon_Origional_concat'
const currentNameField = 'nscf_taxon_name_update_concat'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'dnsm'
});

const specifyDiscipline = 'Herpetology'

const synonyms = {}
let noOriginalName = []
fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    if(!row.hasOwnProperty(originalNameField) || !row.hasOwnProperty(currentNameField)) {
      console.error('missing name fields for record, please fix input file first')
      process.exit()
    }
    //else

    //just some cleaning
    let originalName = null
    let currentName = null
    if(row[originalNameField] && row[originalNameField].trim()) {
      row[originalNameField] = originalName = row[originalNameField].trim()
    }
    

    if(row[currentNameField] && row[currentNameField].trim()) {
      row[currentNameField] = currentName = row[currentNameField].trim()
    }

    if(originalName) {
      if(synonyms.hasOwnProperty(originalName)) {
        synonyms[originalName].push(currentName)
      }
      else {
        synonyms[originalName] = [currentName]
      }
    }
    else {
      if(currentName) {
        noOriginalName.push(currentName)
      }
    }

  })
  .on('end', async rowCount => {
    console.log('successfully read', rowCount, 'from file')
    
    noOriginalName = noOriginalName.filter(onlyUnique)
    if(noOriginalName.length) {
      console.log('the following',  noOriginalName.length, 'current names have no original name in the dataset:')
      console.log(noOriginalName.join('|'))
    }

    const toUpdate = {}
    const multipleSynonyms = {}

    for (const [originalName, synonymsArr] of Object.entries(synonyms)) {
      const uniqueSynonyms = synonymsArr.filter(onlyUnique)
      const nonNullSynonyms = uniqueSynonyms.filter(x => x)

      if(nonNullSynonyms.length) {
        if(nonNullSynonyms.length > 1) {
          multipleSynonyms[originalName] = nonNullSynonyms.join('; ')
        }
        else {
          toUpdate[originalName] = nonNullSynonyms[0]
        }
      }
    }

    const namesToUpdate = Object.keys(toUpdate)
    if(namesToUpdate.length) {
      console.log('got synonyms for', namesToUpdate.length, 'taxon names...')
      conn.connect();

      console.log('first checking database records...')
      const duplicatedNames = {}
      const missingNames = {}
      for(const [originalName, currentName] of Object.entries(toUpdate)) {

        const originalNameRecords = await getTaxon(conn, originalName, specifyDiscipline)
        if(originalNameRecords && originalNameRecords.length) {
          //there can only be one!
          if(originalNameRecords.length > 1) {
            if(!duplicatedNames.hasOwnProperty(originalName)) {
              duplicatedNames[originalName] = true
            }
          }
        }
        else {
          if(!missingNames.hasOwnProperty(originalName)) {
            missingNames[originalName] = true
          }
        }

        const currentNameRecords = await getTaxon(conn, currentName, specifyDiscipline)
        if(currentNameRecords && currentNameRecords.length) {
          //there can only be one!
          if(currentNameRecords.length > 1) {
            if(!duplicatedNames.hasOwnProperty(currentName)) {
              duplicatedNames[currentName] = true
            }
          }
        }
        else {
          if(!missingNames.hasOwnProperty(currentName)) {
            missingNames[currentName] = true
          }
        }
      }

      if(Object.keys(duplicatedNames).length) {
        console.log('There are duplicated names in the taxon backbone, these must be fixed first:')
        console.log(Object.keys(duplicatedNames).join('|'))
      }
  
      if(Object.keys(missingNames).length) {
        console.log('There are missing names in the taxon backbone, these must be added first:')
        console.log(Object.keys(missingNames).join('|'))
      }

      if(Object.keys(duplicatedNames).length || Object.keys(missingNames).length) {
        process.exit()
      }

      //otherwise we're good to go
      console.log('running updates...')
      const inconsistentSynonymy = []
      let updates = 0
      for(const [originalName, currentName] of Object.entries(toUpdate)) {

        const originalNameRecords = await getTaxon(conn, originalName, specifyDiscipline)
        const currentNameRecords = await getTaxon(conn, currentName, specifyDiscipline)

        const originalNameRecord = originalNameRecords[0]
        const currentNameRecord = currentNameRecords[0]

        if(originalNameRecord.AcceptedID) {
          if(originalNameRecord.AcceptedID != currentNameRecord.TaxonID) {
            inconsistentSynonymy.push({originalName, currentName})
          }
        }
        else {
          // await updateTaxonAcceptedName(conn, originalNameRecord.TaxonID, currentNameRecord.TaxonID)
          updates++
        }
      }

      if(inconsistentSynonymy.length) {
        console.log('The following synonyms are inconsistent with the database:')
        console.log('original name | current name')
        for(const is of inconsistentSynonymy) {
          console.log(`${is.originalName} | ${is.currentName}`)
        }
      }

      if(updates) {
        console.log(updates, 'taxa were updated with synonyms in the database')
      }
      else {
        console.log('No synonyms were added to the database')
      }
    }
  })

function getTaxon(conn, name, discipline) {
  return new Promise((resolve, reject) => {
    const sql = `select * from taxon t
      join discipline d on d.taxontreedefID = t.taxontreedefID
      where fullname = '${name}' and d.name = '${discipline}'`
    conn.query(sql, function (error, results, fields) {
      if(error) {
        reject(error)
      }
      //else
      resolve(results)
    })
  })
}

//This assumes we've already checked the originalName doesn't already have an acceptedNameID
function updateTaxonAcceptedName(conn, originalNameTaxonID, currentNameTaxonID) {
  return new Promise((resolve, reject) => {
    const sql = `update taxon set acceptedID = ${currentNameTaxonID}, isAccepted = false
    where taxonID = ${originalNameTaxonID}`
    conn.query(sql, function (error, results, fields) {
      if(error) {
        reject(error)
      }
      //else
      resolve()
    })
  })
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}