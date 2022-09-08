import mysql from 'mysql'
import dotenv from 'dotenv'
import csv from 'fast-csv'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'

dotenv.config('../.env')

const conn = mysql.createConnection({
  host     : 'localhost', //localhost
  user     : 'root', //needs the master username
  password : 'root',
  database : 'unedited_specify'
})

const query = makeMysqlQuery(conn)

const sql = `select p.name as parent, g.name, gtdi.name as type from geography g
join geographytreedefitem gtdi on g.GeographyTreeDefItemID = gtdi.GeographyTreeDefItemID
join geography p on g.ParentID = p.GeographyID`

console.log('reading database...')
const results = await query(sql)

console.log('writing csv...')
csv.writeToPath('out.csv', results, {headers: true})
  .on('error', err => console.error(err))
  .on('finish', () => {
    console.log('All done...')
    process.exit()
  });

