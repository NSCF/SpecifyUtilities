//get duplicate catalog numbers for ditsong inverts

const csv = require('fast-csv');
const path = require('path')
const mysql = require('mysql');

const outFile = 'am aq inv catnums.csv'

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'am'
});

const sql = `select cast(co.CatalogNumber as unsigned) from collectionobject co
join collection c on co.collectionid = co.collectionId
where c.collectionname = 'Aquatic Invertebrates' and cast(co.CatalogNumber as unsigned) >= 900000
order by cast(co.CatalogNumber as unsigned)`

const query = connection.query(sql);
const results = []
query
  .on('error', function(err) {
    // Handle error, an 'end' event will be emitted after this as well
    console.error('Error getting records:', err.message)
  })
/*   .on('fields', function(fields) {
    // the field packets for the rows to follow
  }) */
  .on('result', function(row) {
    results.push(row)
  })
  .on('end', function() {
    console.log('writing csv file')
    csv.writeToPath(path.resolve(__dirname, outFile), results, {headers: true})
    .on('error', err => console.error(err))
    .on('finish', () => {
      console.log('All done!')
      process.exit()
    });
  });