let conns = require('./dbconns')

let countQueries = []

for (db in conns) {
  let coll = db
  countQueries.push(conns[db].query('select count(*) as count from collectionobject')
  .then(result => {return {"db": coll, success: true, count: result[0][0].count}})
  .catch(err => {return {"db": coll, success: false, err: err}}))
}

Promise.all(countQueries).then(results => {
  results.forEach(response => {
    if(response.success) {
      console.log(`${response.db}: ${response.count}`)
    }
    else {
      console.log(`${response.db}: ${response.err.message}`)
    }
  })
}).catch(err => {

}) 