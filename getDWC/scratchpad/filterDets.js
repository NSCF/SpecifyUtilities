let getModels = require('../models/models')
let configs = require('../dbconfigs')

let db = 'local' //lets test this with a few different databases

let models = getModels(configs[db])
let Op = models.Sequelize.Op

getDets()

async function getDets(){
  console.log('fetching records')
  try {
    let records = await models.CollectionObject.findAll({
      where: {'$determinations.dettaxon.fullName$': {[Op.eq]: "Panaspis wahlbergi"}}, //we need this to get records only for this taxon
      include: [
        {
          model: models.Determination,
          as: 'determinations',
          include:[
            {
              model: models.Taxon, 
              as: 'dettaxon'
            }
          ]
        }
      ]
    })
    console.log('record count: ' + records.length)
  }
  catch(err) {
    console.log("error getting records: " + err.message)
  }
}


