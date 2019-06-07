
const {promisify} = require("es6-promisify");


function getSpecifyUserByName(conn, name){
  return new Promise((resolve, reject) => {
    conn.query(`select * from specifyuser where trim(name) = '${name.trim()}'`, (err, res) => {
      if (err){
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })
}

function getSpQueriesForUser(conn, userID, spQueryNames) {
  return new Promise((resolve, reject) => {
    var sql = `select * from spquery where specifyuserid = '${userID}'`
    if(spQueryNames && Array.isArray(spQueryNames) && spQueryNames.length > 0) {
      sql += ` and name in (${conn.escape(spQueryNames)})`
    }
    conn.query(sql, (err, res) => {
      if (err){
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })
}

function getSpQueryFields(conn, queryID) {
  return new Promise((resolve, reject) => {
    conn.query(`select * from spqueryfield where spqueryid = '${queryID}'`, (err, res) => {
      if (err){
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })
}

function deleteSpQuery(conn, specifyuser, name) {
  return new Promise((resolve, reject) => {
    
    var returnObj = {}

    var userID = specifyuser.SpecifyUserID

    //get the query if it exists
    var sql = `select * from spquery where specifyuserid = ${conn.escape(userID)} and  trim(name) = ${conn.escape(name.trim())}`
    conn.query(sql, (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        if (res.length > 0){
          var queryIDs = res.map(q => q.SpQueryID)
          //check if any of these are used for reports, in which case we can't delete them
          sql = `select * from spreport where spqueryid in (${conn.escape(queryIDs)})`
          conn.query(sql, (err, res) => {
            if (err){
              reject(err)
            }
            else {
              if(res.length > 0){
                console.log(`cannot replace query '${name}' for user ${specifyuser.Name} as it is used in a report`)
              }
              else {
                //fields first
                sql = `delete from spqueryfield where spqueryid in (${conn.escape(queryIDs)})` 
                conn.query(sql, (err) => {
                  if (err){
                    reject(err)
                  }
                  else {
                    //then the query itself
                    sql = `delete from spquery where spqueryid in (${conn.escape(queryIDs)})`
                    conn.query(sql, (err) => {
                      if (err){
                        reject(err)
                      }
                      else {
                        resolve()
                      }
                      //no else
                    })
                  }
                })
              }
            }
          })
        }
        else {
          resolve()
        }
      }
    })
  })
}

function addSpQuery(conn, specifyUser, spQuery, queryFields){
  return new Promise((resolve, reject) => {
    var sql = `insert into spquery set ?`
    conn.query(sql, spQuery, (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        var newQueryID = res.insertId
        var addFields = []
        queryFields.forEach(queryField => {
          addFields.push(addSpQueryField(conn, newQueryID, queryField))
        })

        Promise.all(queryFields).then(_ => resolve())
        .catch(err => {
          console.log(`failed to add all query fields for query '${spQuery.Name} for user ${specifyUser.Name}: ${err.message}`)
        })

      }
    })
  })
}

function addSpQueryField(conn, spQueryID, spQueryField){
  return new Promise((resolve, reject) => {
    spQueryField.SpQueryFieldID = null
    spQueryField.SpQueryID = spQueryID
    var sql = `insert into spqueryfield set ?`
    conn.query(sql, spQueryField, (err, res) => {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

function close(conn){
  return new Promise((resolve, reject) => {
    conn.end((err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

module.exports = {
  getSpecifyUserByName,
  getSpQueriesForUser,
  getSpQueryFields,
  deleteSpQuery,
  addSpQuery,
  addSpQueryField,
  close
}