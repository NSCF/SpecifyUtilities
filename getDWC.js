const {t:typy} = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4

let getModels = require('./models/models')
let configs = require('./dbconfigs')

let toDWC = require('./toDwc')

let db = 'local' //the db to work with, this must match a key in configs

let models = getModels(configs[db])

let searchCollection = "PEM Reptiles" //this needs to be a valid collection name for the institution

let removeNSSL = false; // a flag for removing sensitive species 

//lets not rely on taxon names being flagged as NSSL. Rather provide a specific list of NSSL names
let nssl = [
  'Psammobates geometricus', 'Smaug giganteus', 'Bradypodion caeruleogula', 'Ouroborus cataphractus', 'Ceratogyrus paulseni',
  'Homopus signatus', 'Acinonyx jubatus', 'Bitis albanica', 'Bradypodion caffer', 'Bradypodion pumilum', 'Bradypodion thamnobates',
  'Philantomba monticola', 'Poecilogale albinucha', 'Smutsia temminckii', 'Charaxes druceanus solitarius', 'Charaxes marieps', 
  'Charaxes xiphares occidentalis', 'Charaxes xiphares staudei', 'Papilio ophidicephalus zuluensis', 'Falco fasciinucha', 
  'Necrosyrtes monachus', 'Sarothrura ayresi', 'Aegypius occipitalis', 'Gypaetus barbatus', 'Idiothele mira', 'Harpactira pulchripes',
  'Ceratotherium simum', 'Diceros bicornis'
] //I've excluded Opistophthalmus ater here, and added the two baboon spiders and rhinos. 

//TODO use collectionobject.date1 for the embargo date, and then set where below to filter those out. 
let findConfig = {
  limit: 10,
  include: [ 
    {
      model: models.CollectingEvent, 
      as: 'collectingEvent',
      include: [
        {
          model: models.Locality,
          as: 'locality',
          include: [ 
            {
              model: models.GeoCoordDetail,
              as: 'georefDetails',
              include: [
                {
                  model: models.Agent,
                  as: 'geoRefAgent'
                }
              ]
            }, 
            {
              model:models.Geography,
              as: 'geography', 
              include: [
                {
                  model: models.GeographyTreeDefItem,
                  as: 'level',
                  attributes: ['name']
                }
              ]
            } 
          ]
        },
        {
          model: models.Agent, 
          as: 'collectors'
        }
      ] 
    },
    {
      model: models.Collection,
      as: 'collection',
      where: {
        collectionName: searchCollection
      },
      include: [{
        model: models.Discipline,
        as: 'discipline',
        include: [{
          model: models.Division,
          as: 'division',
          include: [{
            model: models.Institution,
            as: 'institution'
          }]
        }]
      }]
    }, 
    {
      model: models.Determination,
      as: 'determinations',
      include: [
        {
          model: models.Taxon,
          as: 'dettaxon',
          attributes: ['taxonID', 'parentID', 'guid', 'name', 'fullName', 'author', 'isAccepted'],
          include: [
            {
              model: models.TaxonTreeDefItem,
              as: 'rank',
              attributes: ["Name"]
            },
            {
              model: models.Taxon,
              as: 'acceptedTaxon',
              attributes: ['taxonID', 'parentID','guid', 'name', 'fullName', 'author', 'isAccepted'],
            }
          ]
        }, 
        {
          model: models.Agent,
          as: 'determiner'
        }
      ]
    },
    {
      model: models.Preparation,
      as: 'preparations',
      include: [
        {
          model: models.PrepType,
          as: 'type',
          attributes: ['name']
        }, 
        {
          model: models.PreparationAttachment,
          as: 'attachments'
        }
      ]
    }, 
    {
      model: models.CollectionObjectAttachment,
      as: 'attachments'
    } 
  ]
}

console.time('fetch-records')
models.CollectionObject.findAll(findConfig)
.then(async collectionObjects => {
  console.timeEnd('fetch-records')
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

  console.time('get-ancestry')
  //get ancestors for taxonomy
  try {
    await getAncestors(taxa, models.Taxon, models.Sequelize.Op.in, 'taxonID', 'parentID', taxonIncludes)
  }
  catch(err) {
    console.log("error fetching ancestors for taxa: " + err.message)
    return //don't continue
  }

  //get ancestors for geography
  try {
    await getAncestors(geographies, models.Geography, models.Sequelize.Op.in, 'geographyId', 'parentId', geographyIncludes)
  }
  catch(err){
    console.log("error fetching ancestors for geography: " + err.message)
    return //don't continue
  }

  console.timeEnd('get-ancestry')
  
  //flatten 
  console.time('makeDWC')
  let dwcrecords = []
  collectionObjects.forEach(co => {
    let dwc = toDWC(co, null, true)
    dwcrecords.push(dwc)
  });


  //remove any fields that are all null in the results, as an option, default true
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

  console.timeEnd('makeDWC')

  //we now have our dataset
  //TODO write to appropriate format (option for csv or DWCa)

})
.catch(err => {
  let i = 0
})

//FUNCTIONS

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

