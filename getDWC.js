let typy = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4

let getModels = require('./models/models')
let configs = require('./dbconfigs')

let db = 'local' //the db to work with, this must match a key in configs

let models = getModels(configs[db])

let searchCollection = "" //this needs to be a valid collection name for the institution

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
          attributes: ['guid', 'name', 'fullName', 'author', 'isAccepted'],
          include: [
            {
              model: models.TaxonTreeDefItem,
              as: 'rank',
              attributes: ["Name"]
            },
            {
              model: models.Taxon,
              as: 'acceptedTaxon',
              attributes: ['guid', 'name', 'fullName', 'author', 'isAccepted'],
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

models.CollectionObject.findAll(findConfig)
.then(collectionObjects => {
  
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
  
  //
  collectionObjects.forEach(co => {
    let collectors = co.collectingEvent.collectors.map(collector => collector.lastName).join(' | ')
    console.log(co.CatalogNumber + ": " + collectors)
  });

  //TODO remove any fields that are all null in the results, as an option, default true
})
.catch(err => {
  let i = 0
})

var i = 0

