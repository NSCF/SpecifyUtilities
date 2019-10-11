const {t:typy} = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4
const { performance } = require('perf_hooks')
const ms = require('pretty-ms');

let getModels = require('./models/models')
let configs = require('./dbconfigs')

let toDWC = require('./toDwc')

let getConfig = require('./getDWCConfig')

/**
 * Extract a Darwin Core file for a collection from  database. Parameters must be passed in an object
 * @param {string} db The target database
 * @param {string} targetCollection The collection name to extract from 
 * @param {string} localityFields A string of concatenated locality fields for building dwc:locality
 * @param {Boolean} removeNSSL Remove records for NSSL taxa from the result?
 * @param {Boolean} addNamespaces Add namespaces for Darwin Core and Dublin Core terms
 * @param {Boolean} removeBlankColumns Remove any columns from the results that have no values
 * @param {Boolean} random Get a random set of results - really only for testing
 * @param {Number} offset 
 * @param {Number} limit 
 */
async function getDWC({db, targetCollection, localityFields = null, removeNSSL = false, addNamespaces = true, removeBlankColumns = true, random = false, offset = null, limit = null}) {
  
  let models = getModels(configs[db])
  let findConfig = getConfig(models, targetCollection)

  //lets not rely on taxon names being flagged as NSSL. Rather provide a specific list of NSSL names
  let nssl = [
    'Psammobates geometricus', 'Smaug giganteus', 'Bradypodion caeruleogula', 'Ouroborus cataphractus', 'Ceratogyrus paulseni',
    'Homopus signatus', 'Acinonyx jubatus', 'Bitis albanica', 'Bradypodion caffer', 'Bradypodion pumilum', 'Bradypodion thamnobates',
    'Philantomba monticola', 'Poecilogale albinucha', 'Smutsia temminckii', 'Charaxes druceanus solitarius', 'Charaxes marieps', 
    'Charaxes xiphares occidentalis', 'Charaxes xiphares staudei', 'Papilio ophidicephalus zuluensis', 'Falco fasciinucha', 
    'Necrosyrtes monachus', 'Sarothrura ayresi', 'Aegypius occipitalis', 'Gypaetus barbatus', 'Idiothele mira', 'Harpactira pulchripes',
    'Ceratotherium simum', 'Diceros bicornis'
  ] //I've excluded Opistophthalmus ater here, and added the two baboon spiders and rhinos. 

  //TODO use collectionobject.date1 for the embargo date, and then set where below to filter those out. - need a parameter for this in the function

  

  if (random){
    findConfig.order = models.sequelize.random()
  }

  if(limit && !isNaN(limit) && limit > 0){
    findConfig.limit = limit
  }

  if(offset && !isNaN(offset) && offset > 0){
    findConfig.offset = offset
  }

  let collectionObjects = [] //just a declaration
  try {
    performance.mark('fetch-records')
    collectionObjects = await models.CollectionObject.findAll(findConfig)
    performance.mark('end-fetch-records')

    if (removeNSSL){
      collectionObjects = collectionObjects.filter(co => {
        var currentDetArr = co.determinations.filter(det => det.isCurrent) //we assume there is always a current det, but there may not be!
        if(currentDetArr.length > 0) { //it should only ever be 1
          let currentDet = currentDetArr[0]
          let fullName = typy(currentDet, 'dettaxon.fullName').safeObject || ""
          let acceptedName = typy(currentDet, 'dettaxon.acceptedTaxon.fullName').safeObject || ""
          let isNSSL = nssl.some(nsslName => fullName.includes(nsslName) || acceptedName.includes(nsslName)) //so we can capture things like Diceros bicornis bicornis with Diceros bicornis
          return !isNSSL //only those which are not NSSL
        }
      })
    }

    //get the taxon and geography ancestors
    let taxa = []
    let geographies = []
    collectionObjects.forEach(co => {
      
      //taxa
      var currentDet = co.determinations.find(det => det.isCurrent) //we assume there is always a current det, but there may not be!
      if(currentDet && currentDet.dettaxon) { 
        taxa.push(currentDet.dettaxon)
      }
    
      //geography
      var geo = typy(co, 'collectingEvent.locality.geography').safeObject || null
      if(geo) {
        geographies.push(geo)
      }
    })
    
    taxa = taxa.filter(taxon => taxon) //get rid of any nulls, although there shouldn't be any
    geographies = geographies.filter(geo => geo)

    let taxonIncludes = [
      {
        model: models.TaxonTreeDefItem,
        as: 'rank',
        attributes: ['Name']
      }
    ]

    let geographyIncludes = [
      {
        model: models.GeographyTreeDefItem,
        as: 'level',
        attributes: ['name']
      }
    ]

    performance.mark('get-ancestry')
    //get ancestors for taxonomy
    try {
      await getAncestors(taxa, models.Taxon, models.Sequelize.Op.in, 'taxonID', 'parentID', taxonIncludes)
    }
    catch(err) {
      let msg = `error fetching ancestors for taxa: ${err.message}`
      err.message = msg
      throw err
    }

    //get ancestors for geography
    try {
      await getAncestors(geographies, models.Geography, models.Sequelize.Op.in, 'geographyId', 'parentId', geographyIncludes)
    }
    catch(err){
      let msg = `error fetching ancestors for geography: ${err.message}`
      err.message = msg
      throw err
    }

    performance.mark('end-get-ancestry')
    
    //flatten 
    performance.mark('makeDWC')
    let dwcrecords = []
    let dwcerrors = []
    collectionObjects.forEach(co => {
      try{
        let dwc = toDWC(co, localityFields, addNamespaces)
        dwcrecords.push(dwc)
      }
      catch(err){
        dwcerrors.push(err.message)
      }
    });

    //remove any fields that are all null in the results, as an option, default true
    if(removeBlankColumns){
      let haveValues = []
      let allKeys = Object.keys(dwcrecords[0])
      dwcrecords.forEach(co => {
        Object.keys(co).forEach(key => {
          if(co[key]){
            if(!haveValues.includes(key)){
              haveValues.push(key)
            }
          }
        })
      })
  
      let blankKeys = allKeys.filter(key => !haveValues.includes(key))
      dwcrecords.forEach(co => {
        blankKeys.forEach(key =>{
          delete co[key]
        })
      })
    }
  
    performance.mark('end-makeDWC')

    //we now have our dataset
    //TODO write to appropriate format (option for csv or DWCa)
    //performance.mark('write-file')
    //performance.mark('end-write-file')

    //all done - get performance
    performance.measure('fetch-records to end-fetch-records', 'fetch-records', 'end-fetch-records')
    performance.measure('get-ancestry to end-get-ancestry', 'get-ancestry', 'end-get-ancestry')
    performance.measure('makeDWC to end-makeDWC', 'makeDWC', 'end-makeDWC')
    let times = {}
    times.getRecords = ms(performance.getEntriesByName('fetch-records to end-fetch-records')[0].duration)
    times.getAncestry = ms(performance.getEntriesByName('get-ancestry to end-get-ancestry')[0].duration)
    times.makeDWC = ms(performance.getEntriesByName('makeDWC to end-makeDWC')[0].duration)
    //times.writeFile = ms(performance.getEntriesByName('write-file to end-write-file')[0].duration)

    performance.clearMarks()
    performance.clearMeasures()

    return {times, dwcerrors, count: dwcrecords.length}
  }
  catch(err) {
    let msg = `error getting collection objects: ${err.message}`
    err.message = msg
    throw err
  }
}



//HELPERS

/**
 * @param {Array} leaves The objects to get ancestry for
 * @param {*} model The sequelize model we are working with
 * @param {Object} inOperator An instance of Sequelize.Op.in
 * @param {*} id The ID field on the current object 
 * @param {*} parentid The parent ID field
 * @param {Array} includes An array of Sequelize includes objects to include in he returned objects
 * @param {Boolean} pop Pop the root ancestor? Default is true
 */
async function getAncestors(leaves, model, inOperator, id, parentid, includes, pop = true){

  let parents = []

  //recursively get all the ancestors
  let fetchedObjectIDs = leaves.map(object => object[id]).filter(onlyUnique)
  let parentIDs = leaves.map(object => object[parentid]).filter(onlyUnique)
  let toFetch = parentIDs.filter(id => id) //no nulls
  while (toFetch.length > 0) {
    
    try {
      let newObjects = await model.findAll({
        where: {
          [id]: {
            [inOperator]: toFetch //this also makes sure there are no duplicates
          }
        },
        include: includes
      })
      parentIDs = newObjects.map(object => object[parentid]).filter(onlyUnique)
      toFetch = parentIDs.filter(parentID => parentID && !fetchedObjectIDs.includes(parentID))
      parents.push(...newObjects) //add the new taxa to parents
      fetchedObjectIDs.push(...toFetch)
    }
    catch(err){
      throw err
    }
  }

  //add the leaves into parents because some may be ancestors to others
  //took me ages to work out that this was needed!!
  parents.push(...leaves)

  //parents should now have everything
  //now we need ancestry for all our leaves
  leaves.forEach(leaf => {
    leaf.ancestors = []
    let parentID = leaf[parentid]
    while(parentID) {
      let parent = parents.find(object => object[id] == parentID)
      if (!parent){
        parentID = null
      }
      else {
        leaf.ancestors.push(parent)
        parentID = parent[parentid]
      }
      
    }
    if(pop){
      leaf.ancestors.pop()
    }
  })

  //leaves are objects so no need to return
  let i = 0
}

//helper function
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

module.exports = getDWC