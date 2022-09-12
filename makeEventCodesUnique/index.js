//make event codes in a particular collection unique by adding a short identifier on the end...

import { nanoid } from 'nanoid'
import mysql from 'mysql'
import dotenv from 'dotenv'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'

dotenv.config('../.env')

//make sure to use env variables here 
const conn = mysql.createConnection({
  host     : process.env.MYSQL_HOST, 
  user     : process.env.MYSQL_ADMIN, 
  password : process.env.MYSQL_ADMIN_PASSWORD,
  database : process.env.SPECIFY_DB
})

const query = makeMysqlQuery(conn)

const collectionname = 'herpetology'
const eventCodeField = 'stationFieldNumber' //note this has to be name in the database, not the customized name in the schema

if (!collectionname || !eventCodeField) {
  console.log('collection and/or event code field not provided')
  process.exit()
}

console.log('fetching collecting events from', collectionname)
const getCollectionEventCodesSQL = `SELECT DISTINCT ce.CollectingEventID as eventID, TRIM(ce.${eventCodeField}) AS code from collectingevent ce
join collectionobject co on co.collectingeventID = ce.collectingEventID
join collection c on co.collectionID = c.collectionID
WHERE c.collectionname = '${collectionname}'`

let collectingevents = await query(getCollectionEventCodesSQL)


if(collectingevents.length > 0) {

  console.log(collectingevents.length, 'collecting events returned')
  //make the index
  const eventsIndex = {}
  for(const ce of collectingevents) {
    if(ce.code in eventsIndex) {
      eventsIndex[ce.code].push(ce.eventID)
    }
    else {
      eventsIndex[ce.code] = [ce.eventID]
    }
  }

  console.log('updating event codes...')
  let updateCount = 0
  for (const [eventCode, eventIDs] of Object.entries(eventsIndex)){

    if(eventIDs.length > 1) { //we only want the unique ones...
      //make the list of identifiers
      let appendices = new Set()
      while (appendices.size < eventIDs.length){
        appendices.add(nanoid(4))
      }
      appendices = Array.from(appendices)

      for (const eventID of eventIDs) {
        const newEventCode = eventCode + '_' + appendices.pop()
        const updateCESQL = `UPDATE collectingevent SET ${eventCodeField} = ${mysql.escape(newEventCode)} WHERE collectingEventID = ${eventID}`
        await query(updateCESQL)
        updateCount++
      }
    }    
  }

  console.log(updateCount, 'event codes updated')
  console.log('add done...')
  process.exit()
}
else {
  console.log('No collecting events for', collectionname)
  process.exit()
}