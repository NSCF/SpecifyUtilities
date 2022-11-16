//written to fix date errors from day and month the wrong way round originally in elmuseum

import mysql from 'mysql'
import dotenv from 'dotenv'
import cliProgress from 'cli-progress'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'

dotenv.config('../.env')

const database = 'elmuseum'
const discipline = 'Invertebrate Zoology'

//SCRIPT

if(!database || !discipline) {
  console.error('database and/or discipline not provided')
  process.exit()
}

//make sure to use env variables here 
const conn = mysql.createConnection({
  host     : process.env.MYSQL_HOST, 
  user     : process.env.MYSQL_ADMIN, 
  password : process.env.MYSQL_ADMIN_PASSWORD,
  database
})

const query = makeMysqlQuery(conn)

//TODO add the necessary filters to work with only the relevant records, including filter for partial dates
const sql = `select ce.collectingeventid as eventID, ce.startdate as startDate, ce.enddate as endDate from collectingevent ce
              join discipline d on ce.disciplineid = d.disciplineid
              where d.name = '${discipline}' and ce.startdate < '2016-12-00' and ce.startdateprecision = 1 and ce.timestampcreated = ce.timestampmodified`

let records
try {
  records = await query(sql)
}
catch(err) {
  console.error('error fetching records:', err.message)
  process.exit()
}

console.log('starting updates')
const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
bar.start(records.length, 0)
let recordsCounter = 0
await query('start transaction')

for (const record of records) {

  let startDate = null
  let endDate = null
  
  //fix them
  let updateSQL = null
  if(record.startDate){
    startDate = new Date(record.startDate).toISOString().split('T')[0]
    let startDateParts = startDate.split('-')
    startDateParts[1] = startDateParts.splice(2, 1, startDateParts[1])[0]
    let fixedStartDate = startDateParts.join('-')

    //we have to check it's a valid date...
    let d = new Date(fixedStartDate)
    if(d.getTime()) {

      updateSQL = `update collectingevent set startdate = '${fixedStartDate}'`

      if(record.endDate){
        endDate = new Date(record.endDate).toISOString().split('T')[0]
        let endDateParts = endDate.split('-')
        [endDateParts[1], endDateParts[2]] = [endDateParts[2], endDateParts[1]]  
        let fixedEndDate = endDateParts.join('-')
    
        d = new Date(fixedEndDate)
        if (d.getTime()){
          updateSQL += `, enddate = '${fixedEndDate}'`
        }
      }

      updateSQL += ` where collectingeventid = ${record.eventID}`
    
      try {
        await query(updateSQL)
      }
      catch(err) {
        await query('rollback')
        console.error('error updating collecting events:', err.message)
        console.log('fix and try again...')
        process.exit()
      }

    }
  }

  recordsCounter++
  bar.update(recordsCounter)

}

bar.stop()
console.log('saving updates...')
await query('commit')
console.log('all done...')


