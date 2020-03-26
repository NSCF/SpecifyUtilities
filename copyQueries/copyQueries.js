var mysql = require('mysql');
var db = require('./copyQueryInterface')

var conn = mysql.createConnection({
  host     : 'specify.up.saiab.ac.za', //localhost
  user     : 'upmaster', //needs the master username
  password : 'Botanical3Gardens',
  database : 'up'
})


var sourceUser = 'ian'; //the user name
var targetUsers = [
  "fanele",
  "nelisiwe",
  "rethabile"
];

var copyQueries = [];

(async function(){

  //get the source user
  var users = await db.getSpecifyUserByName(conn, sourceUser)

  //get the queries
  var sourceQueries = await db.getSpQueriesForUser(conn, users[0].SpecifyUserID, copyQueries)

  if(sourceQueries.length == 0){
    
    var message = 'no source queries found for user ' + sourceUser
    if(copyQueries && Array.isArray(copyQueries) && copyQueries.length > 0) {
       message += ' with names ' + copyQueries
    }
    console.log(message)
    return; //end the function
  }

  //get the queryfields, as a Dictionary object
  var queryfields = {}
  for (var i = 0; i < sourceQueries.length; i++) {
    var queryName = sourceQueries[i].Name;
    var queryID = sourceQueries[i].SpQueryID
    var fields = await db.getSpQueryFields(conn, queryID)
    queryfields[queryName] = fields
  }

  //add for each target user
  for (var i = 0; i < targetUsers.length; i++) {
    var userName = targetUsers[i]
    users = await db.getSpecifyUserByName(conn, userName)
    if(users.length > 0){
      var specifyUser = users[0]
      for (var j = 0; j < sourceQueries.length; j++) {
        var sourceQuery = sourceQueries[j]
        sourceQuery.SpecifyUserID = specifyUser.SpecifyUserID

        sourceQuery.SpQueryID = null //because it needs to autoincrement on insert
        
        //delete the old query if it's there 
        try{
          await db.deleteSpQuery(conn, specifyUser, sourceQuery.Name)
        }
        catch(err){
          console.log(`failed to delete query ${sourceQuery.Name}  for user ${specifyUser.Name} - query not replaced`)
          continue;
        }
        
        
        //add the new query
        try{
          await db.addSpQuery(conn, specifyUser, sourceQuery, queryfields[sourceQuery.Name]);
        }
        catch(err) {
          console.log(`failed to add query ${sourceQuery.Name}  for user ${specifyUser.Name} - try again...`)
        }
        
      }
      console.log('all queries added for user ' + userName)
    }
    else {
      console.log('no user found for name ' + userName)
    }
  }

  db.close(conn).then( _ => {
    console.log('database connection closed')
  })
  .catch(err=> {
    console.log('error closing database connection: ' + err.message
    )
  })

})();

