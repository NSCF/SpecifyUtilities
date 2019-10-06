let typy = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4

let getModels = require('./models/models')
let configs = require('./dbconfigs')

let db = 'local' //the db to work with, this must match a key in configs

let models = getModels(configs[db])

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
          include: [ {
            model: models.GeoCoordDetail,
            as: 'georefDetails'
          } ]
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
        }
      ]
    } 
  ]
}

models.CollectionObject.findAll(findConfig)
.then(collectionObjects => {
  collectionObjects.forEach(co => {
    let collectors = co.collectingEvent.collectors.map(collector => collector.lastName).join(' | ')
    console.log(co.CatalogNumber + ": " + collectors)
  });
})
.catch(err => {
  let i = 0
})

var i = 0

