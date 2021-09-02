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

const sql = `select co.catalogNumber from collectionobject co
join collection c on co.collectionid = c.collectionId
where c.collectionname = 'Other Invertebrates'`

const query = connection.query(sql);
const results = {}
let rowsChecked = 0
let noCatnum = 0
query
  .on('error', function(err) {
    // Handle error, an 'end' event will be emitted after this as well
    console.error('Error getting records:', err.message)
  })
/*   .on('fields', function(fields) {
    // the field packets for the rows to follow
  }) */
  .on('result', function(row) {
    rowsChecked++

    //get the number at the end
    if(row.catalogNumber && row.catalogNumber.trim()) {
      const realCatNumStr = row.catalogNumber.trim().match(/\d+$/)
      if(realCatNumStr && realCatNumStr.length) {
        const realCatNum = Number(realCatNumStr[0])
        if(results[realCatNum]) {
          results[realCatNum].push(row.catalogNumber.trim())
        }
        else {
          results[realCatNum] = [row.catalogNumber.trim()]
        }
      }
      else {
        noCatnum++
      }
    }
    else {
      noCatnum++
    }
  })
  .on('end', function() {
    // all rows have been received
    console.log(rowsChecked, 'records recieved')
    if(noCatnum) {
      console.log(noCatnum, 'with no catalogNumber')
    }
    
    let catNums = Object.keys(results) //the duplicate barcodes
    if(catNums.length) {
      console.log('getting dups')
      const dups = []
      let dupCatNums = 0
      for (let catNum of catNums) {
        if(results[catNum].length > 1) {
          dupCatNums++
          for (const dup of results[catNum]) {
            dups.push({
              catNum,
              dup,
            })
          }
        }
      }

      console.log('writing csv file')
      csv.writeToPath(path.resolve(__dirname, 'Ditsong Invertebrates dup barcodes.csv'), dups, {headers: true})
      .on('error', err => console.error(err))
      .on('finish', () => {
        console.log(dupCatNums, 'duplicate catalogNumbers for' , dups.length, 'records')
        console.log('All done!')
        process.exit()
      });
    }
    else {
      console.error('No results to show')
      process.exit()
    }
  });