//takes an array of higher taxa from a file and outputs the uniques, based on one column...
//includes cleaning so only genus names go through
import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\taxonomy`
const csvFile = String.raw`combined_HOSTS_higherClass.csv` //the full file path and name
const field = 'genus'


const records = []
console.log('reading file')
fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {

    row.genus = row.genus.split(/\s+/)[0]
    
    const index = records.find(x => x[field] == row[field])
    if(!index) {
      records.push(row)
    }
    
  })
  .on('end', async rowCount => {
    console.log('processed', rowCount, 'records')
    console.log('saving to file...')
    csv.writeToPath(path.join(csvPath, csvFile.replace('.csv', '_unique.csv')), records, {headers:true})
    .on('error', err => console.error('error writing file:', err.message))
    .on('finish', () => console.log('All done!'));
  })

