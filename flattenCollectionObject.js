/**
 * Takes the resulting object from the Sequelize query on Specify and returns a flattened Darwin Core object
 * @param {Object} co A collectionObject instance with all associated models
 * @param {string} localityfields A string comma separated locality field names
 * @param {Boolean} includeNamespaces A flat for whether or not to include namespaces on the resulting fields
 */
var flattenco = function(co, localityfields, includeNamespaces){
  //TODO we need a darwin core abbreviated fields object
  dwc = {}

  //record level fields
  dwc.occurrenceID = co.GUID || null //TODO add the Griscoll stuff also - needs to be a resolvable GUID
  dwc.institutionID = typy(co, 'collection.discipline.division.institution.uri').safeObject || null //TODO this needs confirmation
  //dwc.collectionID = typy(co, 'collection.GUID').safeObject || null //TODO confirm this too
  dwc.basisOfRecord = 'PreservedSpecimen' //because it's all museums
  dwc.accessRights = typy(co, 'collection.discipline.division.institution.termsOfUse').safeObject || null
  dwc.licence = typy(co, 'collection.discipline.division.institution.licence').safeObject || null
  dwc.ownerInstitutionCode = null //TODO this needs to be resolved with Specify. Will be an if statement on whether owner institution exists and is different to institution code
  dwc.modified = co.timestampModified.toISOString() //assumes that timestampModified is never null
  dwc.institutionCode = typy(co, 'collection.discipline.division.institution.code').safeObject || null
  dwc.collectionCode = typy(co, 'collection.code').safeObject || null
  
  //occurrence terms
  dwc.catalogNumber = co.catalogNumber || null
  dwc.otherCatalogNumbers = co.altCatalogNumber || null
  dwc.recordNumber = co.fieldNumber || null
  var collectors = typy(co, 'collectingevent.collectors').safeObject ||  null
  if (collectors && Array.isArray(collectors)){
    dwc.recordedBy = getAppendedCollectors(collectors)
  }
  let qty = getOrganismQuantity(co)
  if(qty == 0) {
    dwc.organismQuantity = null
    dwc.organismQuantityType = null
  }
  else {
    dwc.organismQuantity = qty
    dwc.organismQuantityType = 'individuals'
  }

  //TODO sex and lifeStage

  dwc.preparations = getPrepartions(co) || null

  //NEXT  - associated media using collectionobject and preparation attachments
  
  //taxon terms
  //dwc.scientificName
  var currentDet = co.determinations.filter(det => det.isCurrent)[0] //we assume there is always a current det, but there may not be!
  if(currentDet) {
    let name = typy(currentDet, 'dettaxon.fullName').safeObject || null
    let author = typy(currentDet, 'dettaxon.author').safeObject || null
    if(name){
      let scientificName = name.trim()
      if(author) {
        scientificName = `${scientificName} ${author.trim()}`
      }
      dwc.scientificName = scientificName
    }
    else {
      dwc.scientificName = null
    }
    
  }

  //determination terms

  //location fields
  dwc.verbatimLocality = typy(co, 'collectingevent.verbatimLocality').safeObject || null

  //event terms

  //finish off with the occurrence remarks
  dwc.occurrenceRemarks = co.Remarks.trim() || null
}



//helper functions
/**
 * Flattens collectors into dwc.recordedBy as lastName, initials, eg Smith, J.E.
 * @param {Array} collectors An array of Agent objects
 */
function getAppendedCollectors(collectors){
  let appended = collectors.map(agent => {
    let initials = getInitials(agent.firstName, agent.initials, agent.middleInitial)
    let arr = [agent.lastName, initials]
    return arr.join(", ")
  }).join(' | ')
}

//we need this because initials are recorded inconsistently in databases
function getInitials(firstName, initials, middleInitial){

  var allCapsRegex = /^[A-Z\s\.]+$/g

  //check initials first, and make sure they are valid
  if(initials && initials.match(allCapsRegex)){
    return initials.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
  }

  //implicit else
  //check if initials in firstname
  if(firstName && firstName.match(allCapsRegex)){ //we assume this means the initials are in firstName
    return firstName.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
  }
  
  //another implicit else
  if(firstName){
    let firstInitial = firstName.trim()[0].toUpperCase()
    if(middleInitial && middleInitial.match(allCapsRegex)){ //requires that middle initial is caps
      if(middleInitial[0] == firstInitial){ //then we assume that initials are stored in middleInitial
        return middleInitial.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
      }
      else { //we assume it's a real middle initial
        let initials = firstInitial + middleInitial
        return initials.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
      }
    }
  }
  else if (middleInitial){
    if(middleInitial && middleInitial.match(allCapsRegex)){
      return middleInitial.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
    }
  }

  return "" //case with no initials
}

function getOrganismQuantity(co) {
  if (co.countAmt && co.countAmt > 0){
    return co.countAmt;
  }

  //implicit else
  if(co.preparations && Array.isArray(co.preparations) && co.preparations.length > 0) {
    if(co.preparations.length == 1) { //we assume this will have the count
      let prep = co.preparations[0]
      return prep.countAmt;
    }
    else { //filter for corpse or specimen or pinned
      let preps = co.preparations.filter(prep => {
        let type = prep.type.name.toLowerCase()
        return type.includes('corpse') || type.includes('specimen') || type.includes('pin')
      })

      return preps.reduce((a,b) => a.countAmt + b.countAmt)
      
    }
  }

  return 0;
  
}

function getPrepartions(co) {
  if(co.preparations && Array.isArray(co.preparations) && co.preparations.length > 0) {
    //TODO we need to preservation type from a schema mapping. Eg for PEM reptiles it's Text2
    //for now just the count and the type
    let preps = co.preparations.map(prep => {
      let count = prep.countAmt
      let type = typy(prep, 'type.name').safeObject || null
      if(type) {
        if(count > 0) {
          return `${count} ${type.trim()}`
        }
        else {
          return type.trim()
        }
      }
      else {
        return null
      }
    })

    let validPreps = preps.filter(prep => prep) //prep has to be truthy
    
    return validPreps.join(' | ')

  } 
  else {
    return null
  }
}

module.exports = flattenco