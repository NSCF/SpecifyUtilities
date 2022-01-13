//just reads the total number of taxa in a file
//for convenience as the other utilities don't do this
//note to look at the fields used in the script as these are dataset specific

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';

const filePath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\NICD`
const fileName = String.raw`NICD main collection.csv`

let recordCount = 0
const taxonomy = {}
console.log('reading the dataset')
fs.createReadStream(path.join(filePath, fileName))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => {
    console.log('error reading file:')
    console.error(error)
    process.exit()
  })
  .on('data', row => {
    if(row.GENUS && row.GENUS.trim()){
      //this could be a record or an additional identification
      const taxon = [row.GENUS, row.SPECIES, row.SUBSPECIES, row.VARIETY]
        .filter(x => x)
        .map(x => x.trim()) 
        .filter(x => x)
        .join(' ')
      
      if(!taxonomy.hasOwnProperty(taxon)){
        taxonomy[taxon] = true
      }

      //check if it's an actual record
      if((row['PLACE FOUND'] && row['PLACE FOUND'].trim()) || (row['DRAWER NUMBER'] && row['DRAWER NUMBER'].trim())) {
        recordCount++
      }
    }
  })
  .on('end', async rowCount => {
    console.log(rowCount, 'rows read from the dataset')
    console.log(recordCount, 'records found')
    console.log(Object.keys(taxonomy).length, 'unique taxa in the dataset')

    //write out the taxa just to check...
    const taxa = Object.keys(taxonomy).map(name => ({name}))
    const newFileName = fileName.replace(/\.csv$/, '_taxonomy.csv')
    csv.writeToPath(path.resolve(filePath, newFileName), taxa, {headers: true})
      .on('error', err => console.error(err))
      .on('finish', () => {
        console.log('All done...')
        process.exit()
      });

  })
  

