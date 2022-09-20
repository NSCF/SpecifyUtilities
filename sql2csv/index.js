//run a sql statement, get the results, save to csv

import mysql from 'mysql'
import dotenv from 'dotenv'
import csv from 'fast-csv'
import { makeMysqlQuery } from '../utils/makeMysqlQuery.js'

dotenv.config('../.env')

//make sure to use env variables here 
const conn = mysql.createConnection({
  host     : process.env.MYSQL_HOST, //localhost
  user     : process.env.MYSQL_ADMIN, //needs the master username
  password : process.env.MYSQL_ADMIN_PASSWORD,
  database : process.env.SPECIFY_DB
})

const query = makeMysqlQuery(conn)

const outfilename = 'specify_geography.csv'

const sql = `select p.name as parent, g.name, gtdi.name as type from geography g
join geographytreedefitem gtdi on g.GeographyTreeDefItemID = gtdi.GeographyTreeDefItemID
join geography p on g.ParentID = p.GeographyID`

console.log('reading database...')
const results = await query(sql)

console.log('writing csv...')
csv.writeToPath(outfilename, results, {headers: true})
  .on('error', err => console.error(err))
  .on('finish', () => {
    console.log('All done...')
    process.exit()
  });