//moves collection objects from one collection to another, within a single discipline (like after an accidental workbench upload)

import * as mysql from 'mysql'
import cliProgress from 'cli-progress'
import {makeMysqlQuery} from '../utils/makeMysqlQuery.js'

const sourceCollectionName = 'terrestrial invertebrates'
const destCollectionName = 'aquatic invertebrates'
const lowerCatNum = '200000'
const upperCatNum = null

const conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'am'
});

const query = makeMysqlQuery(conn)


//get the collection details
const getSourceCollectionSQL = `SELECT * FROM collection WHERE collectionname = '${sourceCollectionName}'`
const sourceCollections = await query(getSourceCollectionSQL)
if (sourceCollections.length == 0) {
  console.log('no collection found called', sourceCollectionName)
  process.exit()
}
if (sourceCollections.length > 1) {
  console.log('there is more than one collection called', sourceCollectionName)
  process.exit()
}
const sourceCollection = sourceCollections[0]

const getDestCollectionSQL = `SELECT * FROM collection WHERE collectionname = '${destCollectionName}'`
const destCollections = await query(getDestCollectionSQL)
if (destCollections.length == 0) {
  console.log('no collection found called', destCollectionName)
  process.exit()
}
if (destCollections.length > 1) {
  console.log('there is more than one collection called', destCollectionName)
  process.exit()
}
const destCollection = destCollections[0]

//get the collection prep types
let prepTypeSQL = `SELECT * FROM preptype WHERE collectionid = ${sourceCollection.collectionId}`
let prepTypeRecords = await query(prepTypeSQL)

//make an index
const sourcePrepTypes = {}
for (const record of prepTypeRecords) {
  const prepTypeID = record.PrepTypeID
  const name = record.Name.toLowerCase()
  if(!sourcePrepTypes.hasOwnProperty(prepTypeID)){
    sourcePrepTypes[prepTypeID] = name
  }
}


prepTypeSQL = `SELECT * FROM preptype WHERE collectionid = ${destCollection.collectionId}`
prepTypeRecords = null
prepTypeRecords = await query(prepTypeSQL)

//make an index, the other way round
const destPrepTypes = {}
for (const record of prepTypeRecords) {
  const prepTypeID = record.PrepTypeID
  const name = record.Name.toLowerCase()
  if(!destPrepTypes.hasOwnProperty(name)){
    destPrepTypes[name] = prepTypeID
  }
}



//get the collection objects to move...
let getCollectionObjectSQL = `SELECT * FROM collectionobject co
  where collectionid = '${sourceCollection.collectionId}'`

if (lowerCatNum && !upperCatNum) {
  getCollectionObjectSQL += ` AND co.catalognumber > ${lowerCatNum}`
}

if (lowerCatNum && upperCatNum) {
  getCollectionObjectSQL += ` AND co.catalognumber BETWEEN ${lowerCatNum} AND ${upperCatNum}`
}

if (!lowerCatNum && upperCatNum) {
  getCollectionObjectSQL += ` AND co.catalognumber < ${upperCatNum}`
}

console.log('fetching collection objects')
const collectionObjects = await query(getCollectionObjectSQL)

if(collectionObjects.length == 0) {
  console.log('No collection objects were returned...')
  process.exit()
}
console.log(collectionObjects.length, 'collection objects returned')

console.log('running updates')

const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
bar.start(collectionObjects.length, 0)

//run the updates as a transaction
await query('START TRANSACTION')
let counter = 0
for (const co of collectionObjects) {
  
  // get the determinations and update
  const getDetsSQL = `SELECT * FROM determination WHERE collectionobjectid = ${co.CollectionObjectID}`
  const dets = await query(getDetsSQL)
  for (const det of dets){
    const updateDetSQL = `UPDATE determination SET collectionmemberid = ${destCollection.UserGroupScopeId} WHERE determinationid = ${det.DeterminationID}`
    try {
      await query(updateDetSQL)
    }
    catch(err) {
      console.log('There was an error updating dets:')
      console.error(err)
      console.log('executing rollback...')
      await query('ROLLBACK')
      console.log('please fix the error and try again')
      process.exit()
    }
    
  }

  // get the preparations and update
  // we have to do the preptype here also
  const getPrepsSQL = `SELECT * FROM preparation p WHERE p.collectionobjectid = ${co.CollectionObjectID}`
  const preps = await query(getPrepsSQL)
  for (const prep of preps){

    //get the new preptypeid
    const prepType = sourcePrepTypes[prep.PrepTypeID]
    if(!destPrepTypes.hasOwnProperty(prepType)) {
      console.error('The prep type', prepType, 'does not exist for collection', destCollectionName)
      console.log('Add it in Specify, then try to run this update again')
      console.log('executing rollback...')
      await query('ROLLBACK')
      process.exit()
    }
    const newPrepTypeID = destPrepTypes[prepType]

    const updatePrepSQL = `UPDATE preparation SET collectionmemberid = ${destCollection.UserGroupScopeId}, preptypeid = ${newPrepTypeID} WHERE preparationid = ${prep.PreparationID}`
    try {
      await query(updatePrepSQL)
    }
    catch(err) {
      console.log('There was an error updating preps:')
      console.error(err)
      console.log('executing rollback...')
      await query('ROLLBACK')
      console.log('please fix the error and try again')
      process.exit()
    }
  }

  // update co
  const updateCollectionObjectSQL = `UPDATE collectionobject SET collectionid = ${destCollection.collectionId}, collectionmemberid = ${destCollection.UserGroupScopeId}
    WHERE collectionobjectid = ${co.CollectionObjectID}`
  try {
    await query(updateCollectionObjectSQL)
    counter++
    bar.update(counter)
  }
  catch(err) {
    bar.stop()
    console.log('There was an error updating the collection object:')
    console.error(err)
    console.log('executing rollback...')
    await query('ROLLBACK')
    console.log('please fix the error and try again')
    process.exit()
  }
}

console.log('all changes applies successfully, committing...')
await query('COMMIT')
conn.destroy()

console.log('all done...')