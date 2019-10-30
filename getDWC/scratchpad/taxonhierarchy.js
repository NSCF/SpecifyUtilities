let getModels = require('../../models/models')
let configs = require('../../dbconfigs')
let { getAncestors } = require('../transformHelpers')

let db = 'local' //lets test this with a few different databases

let models = getModels(configs[db])

let searchCollection = "PEM Reptiles" //this needs to be a valid collection name for the institution

//get the discipline to work with
console.time('get collection')
models.Collection.findOne(
  { 
    where: {collectionName: searchCollection},
    include: [
      {
        model: models.Discipline, 
        as: 'discipline',
        attributes: ['TaxonTreeDefID'] //we just need this
      }
    ]
  }
).then(collection => {
  console.timeEnd('get collection')
  console.time('get taxa')
  //fetch all the taxonIDs to subset random
  models.Taxon.findAll({
    where: {taxonTreeDefID: collection.discipline.TaxonTreeDefID},
    attributes: ['taxonID', 'parentID', 'fullName'],
    include: [
      {
        model: models.TaxonTreeDefItem,
        as: 'rank',
        attributes: ['Name']
      }
    ]
  }).then(async taxa =>  {
    console.timeEnd('get taxa')
    console.time('get ancestors')
    let sampleSize = 200;
    let leaves = getRandom(taxa, Math.min(taxa.length, sampleSize)) //we want a random set of terminal taxa to start with
    let includes = [
      {
        model: models.TaxonTreeDefItem,
        as: 'rank',
        attributes: ['Name']
      }
    ]

    try {
      await getAncestors(leaves, models.Taxon, models.Sequelize.Op.in, 'taxonID', 'parentID', includes)
    }
    catch(err) {
      console.log("error fetching ancestors for taxa: " + err.message)
      return //don't continue
    }

    console.timeEnd('get ancestors')
    console.log('all done')

    
    //we should now have ancestry for all leaves
    //lets print it all
    leaves.forEach(taxon => {
      let taxonName = `${taxon.fullName}(${taxon.rank.Name})`
      let ancestorNames = taxon.ancestors.map(ancestor => {
        return `${ancestor.fullName}`
      })
      let print =[taxonName, ...ancestorNames].join(' ')
      console.log(print)
    })
    

  }).catch(err => {
    console.log('Error getting taxonIDs: ' + err.message)
  })
}).catch(err =>{
  console.log('Error getting collection: ' + err.message)
})

//from https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
function getRandom(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}