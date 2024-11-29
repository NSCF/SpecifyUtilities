import csv from 'fast-csv'
import path from 'path'

export const writeCSV = async (filePath, fileName, records) => {
  return new Promise((resolve, reject) => {

    try {
      csv.writeToPath(path.join(filePath, fileName), records, {headers: true})
        .on('error', reject)
        .on('finish', resolve);
      }
    catch(err){
      reject(err)
    }
  })
}