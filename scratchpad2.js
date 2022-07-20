const csv = require('fast-csv');
const path = require('path')

const dir = String.raw`D:\NSCF Data WG\Current projects\AMGS FWI data upload`

const uploadFiles = [
  String.raw`AMGS-beetle-sheets-concatenated-Sheet-3-OpenRefine.csv`, 
  String.raw`AMGS-beetle-sheets-concatenated-Sheets-1_2-OpenRefine.csv`,
  String.raw`AMGS-beetle-sheets-concatenated-Sheets-4-6_OpenRefine.csv`
]

const problemRecords = String.raw`AMGS Aq Inverts accession errors.csv`

const getCSVData = csvFile => {
  return new Promise((resolve, reject) => {
    const records = []
    csv.parseFile(csvFile, {headers: true})
    .on('error', error => reject(error))
    .on('data', row => records.push(row))
    .on('end', rowCount => resolve(records));
  })
}

const whereDidTheyComeFrom = async _ => {
  const recs = await getCSVData(path.resolve(dir, problemRecords))
  const problemCatNums = recs.map(x => x['Terr Insect Cat No.'])

  for (const file of uploadFiles){
    const recs = await getCSVData(path.resolve(dir, file))
    const catNums = recs.map(x => x['Terr Insect Cat'])
    const inProblemCats = catNums.filter(x => problemCatNums.includes(x))
    if(inProblemCats.length) {
      console.log(file, 'has the following', inProblemCats.length, 'problem catNums:')
      //console.log(inProblemCats.join('; '))
    }
  }

  return
}

whereDidTheyComeFrom().then(_ => console.log('all done!')).catch(err => console.log(err.message))