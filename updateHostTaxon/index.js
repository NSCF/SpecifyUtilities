//updates for host taxon are not possible through the workbench, so we have to update afterwards
//assumes that the taxonomy for the hosts is uploaded separately through the workbench, but it does check
//reads the original data files for the host taxon data, finds them in the taxon tree, then updates collectingobjectattribute, if it exists

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'
import dotenv from 'dotenv'
import {makeMysqlQuery} from '../utils/makeMysqlQuery.js'
import onlyUnique from '../utils/onlyUnique.js'

dotenv.config()

//SETTINGS
const collectionName = "Parasitic helminths"
const fileDirectory = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\edited data\final edits`
let fileName = String.raw`NCAH-Secondary-collection-edited-20220805-OpenRefine-StorageUpdates-collectorsFieldsAdded-OpenRefine_coordsAdded.csv`
const catalogNumberField = 'NCAH no.'
const hostTaxonNameField = 'Host species'
const verbatimTaxonField = null
const conn = mysql.createConnection({
  host     : process.env.MYSQL_HOST,
  user     : process.env.MYSQL_ADMIN,
  password : process.env.MYSQL_ADMIN_PASSWORD,
  database : 'specifyovr'
});

//SCRIPT
const query = makeMysqlQuery(conn)

if(!fileDirectory || !fileDirectory.trim() || !fileName || !fileName.trim()){
  console.error('check file name and directory')
  console.log('exiting...')
  process.exit()
}

const records = [] //the records from the dataset

//add file extension if necessary
if (!/\.csv$/i.test(fileName)) {
  fileName = fileName += '.csv'
}

console.log('reading the dataset')
fs.createReadStream(path.join(fileDirectory, fileName))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => {
    console.log('error reading file:')
    console.error(error)
    process.exit()
  })
  .on('data', row => {
    //basic error checking for the first record
    if(!row.hasOwnProperty(catalogNumberField)) {
      console.error('catalog number field', catalogNumberField,  'not found in dataset. Please check')
      process.exit()
    }

    if(!row.hasOwnProperty(hostTaxonNameField)) {
      console.error('host taxon field', hostTaxonNameField,  'not found in dataset. Please check')
      process.exit()
    }


    const hostTaxon = row[hostTaxonNameField] && row[hostTaxonNameField].trim() ? row[hostTaxonNameField].trim() : null
    const verbatimHostTaxon = row[verbatimTaxonField] && row[verbatimTaxonField].trim() ? row[verbatimTaxonField].trim() : null
    if(hostTaxon || verbatimHostTaxon) {
      records.push({
        catalogNumber: row[catalogNumberField],
        hostTaxon,
        verbatimHostTaxon
      })
    }
  })
  .on('end', async rowCount => {
    console.log(rowCount, 'records read from dataset with', records.length, 'having host taxon data')
    
    //first check all the taxon names are in the database
    conn.connect();

    //for the main dataset we need to exclude records with specific catalog numbers because they were duplicated!
    const duplicatesSQL = `select altcatalognumber as altCatNum from collectionobject where catalognumber is null and altcatalognumber is not null`
    let duplicatecatnums = null
    try {
      duplicatecatnums = await query(duplicatesSQL)
      duplicatecatnums = duplicatecatnums.map(x => x.altCatNum).filter(onlyUnique)
      let obj = {}
      for(const catNum of duplicatecatnums){
        obj[catNum] = true
      }
      duplicatecatnums = obj
    }
    catch(err) {
      console.error('error reading duplicate catnums from database:', err.message)
      console.log('exiting...')
      process.exit()
    }

    const noTaxonMatches = []
    const duplicateHostTaxa = []
    let updates = 0
    for (const record of records) {

      //we don't want to process any where the catalog number is duplicated
      if(duplicatecatnums.hasOwnProperty(record.catalogNumber)) {
        continue;
      }

      let hostTaxonID = null
      if(record.hostTaxon) {
        const sql =`select taxonid as taxonID from taxon where fullname = '${record.hostTaxon}'`
        let taxonrecords
        try {
          taxonrecords = await query(sql)
        }
        catch(err) {
          console.error('error fetching taxon data:', err.message)
          console.log('exiting...')
          process.exit()
        }
        
        if(taxonrecords.length > 0) {
          if(taxonrecords.length > 1) { //there are duplicate host taxon names!
            duplicateHostTaxa.push(record.hostTaxon)
          }
          else { //only one
            hostTaxonID = taxonrecords[0].taxonID
          }
        }
        else { //not found
          noTaxonMatches.push(record.hostTaxon)
        }
      }

      //do the update
      //get the ce attributeID
      const getceSQL = `select ce.collectingeventID as collectingEventID, ce.collectingeventattributeid as collectingEventAttributeID from collectingevent ce 
        join collectionobject co on co.collectingeventid = ce.collectingeventid
        join collection c on co.collectionid = c.collectionid
        where c.collectionname = '${collectionName}' and co.catalogNumber = '${record.catalogNumber}'`

      let collectingEvents = null
      try {
        collectingEvents = await query(getceSQL)
      }
      catch(err) {
        console.error('error fetching collectingevents:', err.message)
        console.log('exiting...')
        process.exit()
      }

      if(collectingEvents && collectingEvents.length > 0) {
        if(collectingEvents.length == 1) { //it should be
          let updatesql = `update collectingeventattribute set hosttaxonid = ${hostTaxonID}, text2 = null
          where collectingeventattributeid = ${collectingEvents[0].collectingEventAttributeID}`

          try {
            await query(updatesql)
          }
          catch(err) {
            console.error('error updating database:', err.message)
            console.log('exiting...')
            process.exit()
          }
          
          updates++
        }
        else {
          console.error('got more than one collecting event for a specimen record!')
          console.log('catalog number is', record.catalogNumber)
          console.log('exiting...')
          process.exit()
        }
      }
      else {
        console.error('no collecting event found for record', record.catalogNumber)
      }
    }

    if(updates) {
      console.log(updates, 'host taxa updated in the db')
    }
    else {
      console.log('no updates were made to the database')
    }

    if(noTaxonMatches.length) {
      console.log('')
      console.log('The following host taxa were not found in the db, please update them manually:')
      console.log(noTaxonMatches.filter(onlyUnique).join(', '))
    }

    if(duplicateHostTaxa.length) {
      console.log('')
      console.log('The following host taxa are duplicated in the database, please merge the duplicates:')
      console.log(duplicateHostTaxa.filter(onlyUnique).join(', '))
    }

    console.log('all done!')

    process.exit()

  })
