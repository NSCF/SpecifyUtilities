//updates for host taxon are not possible through the workbench, so we have to update afterwards
//assumes that the taxonomy for the hosts is uploaded separately through thw workbench

import * as util from 'util';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import * as mysql from 'mysql'
import ProgressBar from 'progress'

//SETTINGS
const discipline = "entomology"
const collection = "collectionname"
const fileDirectory = ''
const fileName = ''
const catalogNumberField = ''
const hostTaxonfield = ''
const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'ovr'
});

//SCRIPT
const query = util.promisify(conn.query)

if(!fileDirectory || !fileDirectory.trim() || !fileName || !fileName.trim()){
  console.error('check file name and directory')
  console.log('exiting...')
  process.exit()
}


//READ THE DATASET
const records = []
const taxonomy = {}
console.log('reading the dataset')
fs.createReadStream(path.join(fileDirectory, fileName))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => {
    console.log('error reading file:')
    console.error(error)
    process.exit()
  })
  .on('data', row => {
    if(!row.hasOwnProperty(catalogNumberField)) {
      console.error('catalog number field', dataTaxonField,  'not found in dataset. Please check')
      process.exit()
    }

    if(!row.hasOwnProperty(hostTaxonfield)) {
      console.error('host taxon field', hostTaxonfield,  'not found in dataset. Please check')
      process.exit()
    }

    if(row[hostTaxonfield] && row[hostTaxonfield].trim()) { //only process records that have a host taxon
      const taxon = row[hostTaxonfield].trim()
      if(!taxonomy.hasOwnProperty(taxon)) {
        taxonomy[taxon] = true
      }
      records.push(row)
    }
  })
  .on('end', async rowCount => {
    console.log(rowCount, 'records read from dataset')
    

    //first check all the taxon names are in the database
    conn.connect();
    console.log('checking host taxa are in taxon tree...')
    const hostTaxonNames = Object.keys(taxonomy)
    const notInDB = []
    const duplicates = []
    let bar = new ProgressBar(':bar', {total: hostTaxonNames.length})
    for (const name of hostTaxonNames) {
      const sql = `select * from taxon t 
        join taxontreedef ttd  on t.taxontreedefid = ttd.taxontreedefid
        join discipline d on d.taxontreedefid = ttd.taxontreedefid
        where t.fullName = '${name}' and d.name = '${discipline}'`

      try {
        const results = await query(sql)
        bar.tick()
        if(results.length == 0) {
          notInDB.push(name)
        }

        if (results.length > 1) {
          duplicates.push(name)
        }

        //save the results for later...
        if(results.length == 1) {
          taxonomy[name] = results[0]
        }
      }
      catch(err) {
        console.error('error reading from database:', err.message)
        console.log('exiting')
        process.exit()
      }
      
      if (notInDB.length) {
        console.log('The following taxa are not in the taxon tree, please update them first:')
        console.log(notInDB.join('|'))
      }

      if (duplicates.length) {
        console.log('The following taxa are duplicated in the taxon tree, please fix them first:') 
        console.log(duplicates.join('|'))
      }

      //check all the catalog numbers are in the db
      console.log('checking records are in the database...')
      const catNumsNotInDB = []
      const catNumDuplicates = []

      bar = new ProgressBar(':bar', {total: records.length})
      for (const record of records) {
        const catNum = record[catalogNumberField]
        const sql = `select * from collectionobject co
          join collection c on co.collectionid = c.collectionid
          where co.catalognumber = '${catNum}'`

        try {
          const results = await query(sql)
          bar.tick()
          if(results.length == 0) {
            catNumsNotInDB.push(catNum)
          }
          if(results.length > 1) {
            catNumDuplicates.push(catNum)
          }
        }
        catch(err) {
          console.error('error reading database:', err.message)
          console.log('exiting')
          process.exit()
        }
      }

      if (catNumsNotInDB.length) {
        console.log('The following catalog numbers are not in the database, please fix:')
        console.log(catNumsNotInDB.join('|'))
      }

      if (catNumDuplicates.length) {
        console.log('The following catalog numbers are duplicated in the database, please fix them first:') 
        console.log(catNumDuplicates.join('|'))
      }

      //stop here if there are any problems
      if(notInDB.length || duplicates.length || catNumsNotInDB.length || catNumDuplicates.length){
        console.log('exiting...')
        process.exit()
      }

      //here we can make the upates
      console.log('updating database')
      bar = new ProgressBar(':bar', {total: records.length})
      for (const record of records) {
        const taxonName = record[hostTaxonfield].trim()
        const taxonID = taxonomy[taxonName].taxonID
        const catNum = record[catalogNumberField].trim()

        const updateSql = `update collectingeventattribute cea
          join collectingevent ce on cea.collectingeventid = ce.collectingeventid
          join collectionobject co on co.collectingeventid = ce.collectingeventid
          join collection c on c.collectionid = co.collectionid
          set cea.hosttaxonid = ${taxonID}
          where co.catalogNumber = '${catNum}' and c.collectionname = '${collection}'`

        try {
          const results = await query(updateSql)
          bar.tick()
        }
        catch(err) {
          console.error('error updating database:', err.message)
          console.log('exiting...')
          process.exit()
        }
      }

      conn.end()
      console.log('all done, please check a few records to see if the updates where successfull')
      process.exit()
    }
  })
