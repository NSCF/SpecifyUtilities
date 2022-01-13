//takes a file with unique species names and gets the authorities from globalnames or gbif

import * as fs from 'fs';
import * as path from 'path';
import csv from 'fast-csv';
import fetch from 'node-fetch';

const csvPath = String.raw`D:\NSCF Data WG\Current projects\Specify migration\ARC Specify migration\ARC specimen data for Specify migration\OVR\Helminths\taxonomy`
const csvFile = String.raw`Recapture-of-accession-data-NCAH-Historical-collection_HOSTS_ONLY.csv` //the full file path and name
const targetField = 'taxonName'
const restrictToRank = 'kingdom'
const restrictToName = 'Animalia'

fs.createReadStream(path.join(csvPath, csvFile))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', row => {})
  .on('end', async rowCount => {})