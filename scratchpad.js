//get duplicate catalog numbers for ditsong inverts

const csv = require('fast-csv');
const path = require('path')
const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'specify'
});

const sql = `select co.catalogNumber, d.text1 as verbatimDet from collectionobject co
join determination d on d.CollectionObjectID = co.CollectionObjectID
join collection c on co.collectionid = c.collectionId
where c.collectionname = 'Other Invertebrates'`

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
    csv.writeToPath(path.resolve(__dirname, 'Ditsong Invertebrates verbatimDet backup.csv'), results, {headers: true})
    .on('error', err => console.error(err))
    .on('finish', () => {
      console.log('All done!')
      process.exit()
    });
  });