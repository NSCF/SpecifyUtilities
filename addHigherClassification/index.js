//once you've fetched and checked higher classification, this will add it to the dataset (it joins the data)
//it stops if any taxa in the dataset are not found in the higher classification

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';

const dataPath = String.raw`D:\NSCF Data WG\Specify migration\ARC PHP\NCA`
const dataFile = String.raw`NCA-taxa-20220615-OpenRefine_authorites-added.csv`
const taxonomyPath = dataPath //String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\taxonomy`
const taxonomyFile = String.raw`NCA-taxa-20220615-OpenRefine_authorites-added_higherClass.csv`

const dataTaxonField = 'FullName'
const taxonomyTaxonField = 'name'

const records = []
const taxonomy = {}
fs.createReadStream(path.join(dataPath, dataFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {
    if(!row.hasOwnProperty(dataTaxonField)) {
      console.error('taxon field', dataTaxonField,  'not found in dataset. Please check')
      process.exit()
    }
    records.push(row)
  })
  .on('end', rowCount => {
    console.log('successfully read', rowCount, 'records from data file')

    fs.createReadStream(path.join(taxonomyPath, taxonomyFile))
      .pipe(csv.parse({ headers: true }))
      .on('error', error => console.error(error))
      .on('data', row => {

        if(!row.hasOwnProperty(taxonomyTaxonField)) {
          throw new Error('no', taxonomyTaxonField, 'in taxonomy dataset')
        }

        let targetTaxonName = row[taxonomyTaxonField]
        if(targetTaxonName && targetTaxonName.trim()) {
          targetTaxonName = targetTaxonName.trim()
          if(taxonomy.hasOwnProperty(targetTaxonName)) {
            console.error('the taxonomy dataset contains duplicate genus names, please fix first')
            process.exit()
          }
          else {
            for(const [key, val] of Object.entries(row)) {
              if(val && val.trim()) {
                row[key] = val.trim() //trim strings, because the dataset may have been edited manually...
              }
              else {
                row[key] = null
              }
            }
            taxonomy[targetTaxonName] = row
          }
        }
        
      })
      .on('end', rowCount => {
        console.log('successfully read', rowCount, 'records from taxonomy file')

        const missingNames = new Set()
        for(const record of records) {
          if(record.hasOwnProperty(dataTaxonField)) {
            let taxonName = record[dataTaxonField]
            if(taxonName && taxonName.trim()) {
              taxonName = taxonName.trim()

              if(taxonomy.hasOwnProperty(taxonName)) {
                Object.assign(record, taxonomy[taxonName]) //the magic...
              }
              else {
                missingNames.add(taxonName)
              }
            }
          }
        }

        if(missingNames.size) {
          console.log('The following names from the dataset were not found in the taxonomy:')
          console.log(Array.from(missingNames).join('|'))
        }

        //splice the headers into the right location
        const headers = Object.keys(records[0])
        const firstTaxonomyKey = Object.keys(taxonomy)[0]
        const firstTaxonomy = taxonomy[firstTaxonomyKey]
        const taxonomyHeaders = Object.keys(firstTaxonomy) 

        const fieldIndex = headers.indexOf(dataTaxonField)
        headers.splice(fieldIndex, 0, ...taxonomyHeaders)

        //we also need to remove them from the end
        const firstTaxonomyHeader = taxonomyHeaders[0]
        const lastIndex = headers.lastIndexOf(firstTaxonomyHeader)
        headers.splice(lastIndex)


        //write the results
        const fileName = dataFile.replace(/\.csv$/, '_classificationAdded.csv')
        csv.writeToPath(path.resolve(dataPath, fileName), records, {headers})
          .on('error', err => console.error(err))
          .on('finish', () => {
            console.log('All done...')
            process.exit()
          });
      })
  })