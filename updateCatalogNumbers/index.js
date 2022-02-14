import * as mysql from 'mysql'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'specifyovr'
});

const collection = 'parasitic helminths'

const query = makeMysqlQuery(conn)

conn.connect()

//get all the records we want

let sql = `select co.* from collectionobject co 
join collection c on co.collectionid = c.collectionid
where co.catalognumber is null
`
query(sql).then(async records => {

  console.log(records.length, 'records to update')

  let counter = 0
  let errors = []
  for (let record of records) {
    const sql = `update collectionobject co 
    set co.AltCatalogNumber = '${record.Text2}' 
    where co.collectionobjectid = ${record.CollectionObjectID}`

    try {
      await query(sql)
      counter++
    }
    catch(err) {
      errors.push(record)
    }
  }

  conn.end()

  if(errors.length) {
    console.log(errors.length, 'record/s were not updated:')
    console.log(errors.map(x => x.CollectionObjectID).join(', '))
  }

  console.log(counter, 'records updated successfully')
  console.log('Bye!')
})

