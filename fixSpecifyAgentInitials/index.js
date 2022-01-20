// updates the agent.initials field to contain full initials. Also removes initials from firstname if they are there
//NB check this against examples of agents from a database before running, it might not be general enough yet to catch all cases...

import * as mysql from 'mysql'
import {makeMysqlQuery} from '../utils/makeMysqlQuery.js'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'elmuseumituser',
  password : '1Little-Port!Elizabeth',
  database : 'elmuseum'
});

const query = makeMysqlQuery(conn)


query('select * from agent').then(async results => {
  let recordsUpdated = 0
  for (const row of results) {
    const update = getFieldUpdates(row)

    //for testing
    /* if(row.FirstName && update.initials != row.FirstName.replace(/[\.\s]/g, '')){
      console.log(`${row.LastName} ${row.FirstName} | ${update.initials} ${update.firstName}`)
    } */

    if(update.firstName || update.initials) {
      const updateSQL = `
      update agent
        set initials = ${update.initials ? `'${update.initials}'` : 'null'}, firstname = ${update.firstName? `'${update.firstName}'` : 'null' }
        where agent.agentid = ${row.AgentID}
      `.trim()
      try {
        await query(updateSQL)
        recordsUpdated++
      }
      catch(err) {
        console.error('error updating database:', err.message)
        console.log('exiting...')
        process.exit()
      }
    }
  }
  console.log(recordsUpdated, 'agents updated')
  console.log('Bye...')
  process.exit()
})

function getFieldUpdates(record) {
  const result = {
    firstName: null,
    initials: null
  }
  if(record.FirstName && record.FirstName.trim()) {
    let parts = record.FirstName.trim().split(/[\.\s]/).filter(x => x).map(x => x.replace(/-/g, '').trim()).filter(x => x)
    let actualFirstName = null
    for (const [i, part] of parts.entries()) {
      //test if NOT all caps, in which case it's NOT initials
      if(!/^[A-Z\s\.]+$/.test(part)) {
        if(!actualFirstName) {
          actualFirstName = part
        }
        parts[i] = part[0].toUpperCase()
      }
    }
    
    if (record.MiddleInitial && record.MiddleInitial.trim()) {
      parts.push(record.MiddleInitial.trim()[0].toUpperCase())
    }

    result.firstName = actualFirstName
    result.initials = parts.join('')

  }
  return result
}

