import csv from 'fast-csv'
import fs from 'fs'
import path from 'path'

export const readCSV = async (filePath, fileName) => {
  return new Promise((resolve, reject) => {
    const records = []
    fs.createReadStream(path.resolve(path.join(filePath, fileName)))
    .pipe(csv.parse({ headers: true }))
    .on('error', err => {
      reject(err)
    })
    .on('data', row => {
      records.push(row)
    })
    .on('end', async rowCount => {
      resolve(records)
    })
  })
}