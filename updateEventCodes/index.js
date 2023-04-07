//adding event codes back to the database...
import mysql from 'mysql'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'
import { readCSV } from '../utils/readCSV.js'

dotenv.config('../.env')

const database = 'elmuseum'

const csvPath = String.raw`C:\Users\engelbrechti\Downloads`
const csvFile = String.raw`elm-malacology-eventcodes-withdetails-sept2022-OpenRefine V2.csv`

const collectingEventIDField = 'collectingeventid'
const eventCodeField = 'eventCode'
const specifyEventCodeField = 'StationFieldNumber'

//SCRIPT

//make sure to use env variables here 
const conn = mysql.createConnection({
  host     : process.env.MYSQL_HOST, 
  user     : process.env.MYSQL_ADMIN, 
  password : process.env.MYSQL_ADMIN_PASSWORD,
  database
})

const query = makeMysqlQuery(conn)

if (!collectingEventIDField || !eventCodeField || !specifyEventCodeField) {
  console.log('required field names not set')
  process.exit()
}

console.log('reading data file')
let records
try {
  records = await readCSV(csvPath, csvFile)
}
catch(err) {
  console.error('error reading file:', err.message)
  process.exit()
}


console.log('updating database...')
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
bar.start(records.length, 0)
conn.beginTransaction(async err => {
  if(err) {
    console.error('there was an error starting the transation...')
    process.exit()
  }

  let recordCounter = 0
  for (const record of records) {
  
    if(!record.hasOwnProperty(collectingEventIDField) || !record.hasOwnProperty(eventCodeField)) {
      console.error('dataset does not have one or both fields:', collectingEventIDField, eventCodeField)
      console.log('please correct and try again')
      process.exit()
    }
  
    const collectingEventID = record[collectingEventIDField]
    const eventCode = record[eventCodeField]
  
    if(eventCode && eventCode.trim()){
      const updateSQL = `UPDATE collectingevent set ${specifyEventCodeField} =  '${eventCode.trim()}' where collectingeventid = ${collectingEventID}`
      try {
        await query(updateSQL)
      }
      catch(err) {
        bar.stop()
        console.error(err.message)
        console.error('exiting...')
        conn.rollback(err => {
          console.error('There was an error rolling back...')
          process.exit()
        })
      }
    }
  
    recordCounter++
    bar.update(recordCounter)
  }
  
  bar.stop()
  console.log('commiting changes...')
  conn.commit(err => {
    if(err) {
      console.error('There was a problem committing:', err.message)
      console.log('rolling back...')
      conn.rollback(err => {
        if(err) {
          console.log('There was an error rolling back:', err.message)
          process.exit()
        }
      })
    }
    console.log('all done')
    process.exit()
  })
})

