//promisifies conn.query, because util.promisify doesn't work
export const makeMysqlQuery = conn => {
  return sql => {
    return new Promise((resolve, reject) => {
      conn.query(sql, (err, results, fields) => {
        if(err) reject(err)
        resolve(results)
      })
    })
  }
}