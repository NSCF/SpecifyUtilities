const getDWC = require('./getDWC')



let allLocal = ['AFRC Specimens', 'East London Birds', 'KZNM Herpetology', 'KZNM Mammals', 'KZNM Taxidermy', 
'McGregor Museum Bird Collection', 'McGregor Museum Herpetology Collection', 'McGregor Museum Mammal Collection', 
'PEM Amphibians', 'PEM Reptiles', 'PEM Mammals', 'UP Observations', 'UP Specimens', 'ZEN355']

let collections = {
  dnsm: ['Amphibians', 'Birds', 'Echinoderms', 'Entomology', 'Fish', 'Fossils', 'Mammals', 'Reptiles', 'Shells', 'Spiders'],
  ditsong: ['Archaeozoology', 'Birds', 'Entomology', 'Herpetology', 'Mammals', 'Other Invertebrates'],
  amathole: ['Mammal Collection'],
  bayworld: ['PEM Reptiles', 'PEM Mammals', 'PEM Amphibians'],
  elmuseum: ['Bird Collection', 'Malacology'],
  mmk: ['Bird Collection', 'Herpetology Collection', 'Mammal Collection'],
  kznm: ['Arachnida', 'Crustacea', 'Herpetology3', 'Insecta', 'Myriapoda', 'Oligochaeta'],
  local: allLocal
}

let institution = 'local'
let singleCollection =  null//optional to get specific collections, otherwise null

getAllRecords(collections, institution, singleCollection)

//FUNCTIONS

//promisify it so that we can get errors in a Promise.all
function getDarwinCore(params){
  return new Promise((resolve, reject)=> {
    getDWC(params)
    .then( result => resolve({db: params.db, collection: params.targetCollection, status:'success', times: result.times, dwcerrors: result.dwcerrors, count: result.count }))
    .catch(err => resolve({db: params.db, collection: params.targetCollection, status: 'failed', error: err}))
  })
}

async function getAllRecords(collections, institution, singleCollection){
  
  let results = []
  if(singleCollection){
    console.log('getting records for ' + singleCollection)
    results.push(await getDarwinCore({db: institution, targetCollection: singleCollection}))
  }
  else {
    for (const collection of collections[institution]) {
      console.log('getting records for ' + collection)
      let result = await getDarwinCore({db: institution, targetCollection: collection})
      results.push(result)
    }
  }
  
  let dwcerrors = {}
  let getDWCFails = {}
  console.log('')
  results.forEach(result => {
    if(result.status == 'success'){

      //performance
      console.log('Times for ' + result.collection + ': ')
      Object.keys(result.times).forEach(key => {
        console.log(key + ": " + result.times[key])
      })
      console.log('Record count: ' + result.count)
      console.log('')

      if(result.dwcerrors.length > 0){
        result.dwcerrors.forEach(error => {
          if(dwcerrors[error]){
            dwcerrors[error]++
          }
          else {
            dwcerrors[error] = 1
          }
        })
      }
    }
    else {
      if(getDWCFails[result.error]){
        getDWCFails[result.error]++
      }
      else {
        getDWCFails[result.error] = 1
      }
    }
  })

  if(Object.keys(dwcerrors).length > 0) {
    console.log("Errors in toDWC: ")
    Object.keys(dwcerrors).forEach(key =>{
      console.log(key + ": " + dwcerrors[key])
    })
  }

  if(Object.keys(getDWCFails).length > 0){
    console.log("Errors in getDWC: ")
    Object.keys(getDWCFails).forEach(key =>{
      console.log(key + ": " + getDWCFails[key])
    })
  }

  if(Object.keys(dwcerrors).length == 0 && Object.keys(getDWCFails).length == 0) {
    console.log("NO ERRORS!")
  }

  console.log('all done')
}





