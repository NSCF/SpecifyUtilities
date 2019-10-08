let typy = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4

const {
  getFormattedAgent,
  getOrganismQuantity,
  getPrepartions,
  getAssociatedMedia,
  getPartialDate,
  getISODateRange,
  fixString
} = require('./transformHelpers')


/**
 * Takes the resulting object from the Sequelize query on Specify and returns a flattened Darwin Core object
 * @param {Object} co A collectionObject instance with all associated models
 * @param {string} localityfields A string comma separated locality field names in the order that must be used to construct the locality string
 * @param {Boolean} includeNamespaces A flat for whether or not to include namespaces on the resulting fields
 */
var transformToDwc = function(co, localityfields, includeNamespaces){
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
  if(co.altCatalogNumber && co.altCatalogNumber.trim()){
    dwc.otherCatalogNumbers = co.altCatalogNumber.replace(/,/g, ' | ').replace(/;/g, ' | ').replace(/\//g, ' | ').replace(/\s+/g, ' ')
  }
  else {
    dwc.otherCatalogNumbers = null
  }
  dwc.recordNumber = co.fieldNumber || null
  dwc.fieldNumber = typy(co, 'collectingevent.stationFieldNumber') || null //this is an Event field but its here with the other similar fields
  var collectors = typy(co, 'collectingevent.collectors').safeObject ||  null
  if (collectors && Array.isArray(collectors) && collectors.length > 0){
    let formattedCollectors = collectors.map(agent => getFormattedAgent(agent)).filter(formatted => formatted)
    if(formattedCollectors.length > 0) {
      dwc.recordedBy = formattedCollectors.join(' | ')
    }
    else {
      dwc.recordedBy = null
    }
    
  }
  else {
    dwc.recordedBy = null
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

  //TODO sex and lifeStage - these will be custom fields on every database

  dwc.preparations = getPrepartions(co) || null
  dwc.associatedMedia = [].join(' | ') //TODO complete getAssociatedMedia(). I think this might have to come from Flickr
  
  //taxon terms
  //TODO: add the taxon ranks after working out how sequelize-hierarchy works

  //dwc.scientificName
  var currentDetArr = co.determinations.filter(det => det.isCurrent) //we assume there is always a current det, but there may not be!
  if(currentDetArr.length > 0) { //it should only ever be 1
    currentDet = currentDetArr[0]
    let name = typy(currentDet, 'dettaxon.fullName').safeObject || null
    let author = typy(currentDet, 'dettaxon.author').safeObject || null
    let rank = typy(currentDet, 'dettaxon.rank.Name').safeObject || null
    let qualifier = currentDet.qualifier || null
    let accepted = typy(currentDet, 'dettaxon.isAccepted').safeObject || true //we don't want accidental falsy values here
    
    if(name){ //this should always be the case
      let scientificName = name.trim()
      if(author) {
        scientificName = `${scientificName} ${author.trim()}`
      }
      dwc.scientificName = scientificName
      
      dwc.identificationQualifier = qualifier //this is an identification term
      dwc.taxonRank = rank
      dwc.taxonomicStatus = accepted? 'accepted' : 'invalid' //Specify only records accepted or not, no other categories for taxonomicStatus unless recorded in a custom field

      //acceptedNameUsage
      if(!accepted) {
        let acceptedName = typy(currentDet, 'dettaxon.acceptedTaxon.fullName').safeObject || null
        let acceptedAuthor = typy(currentDet, 'dettaxon.acceptedTaxon.author').safeObject || null
        dwc.acceptedNameUsage = `${acceptedName.trim()} ${acceptedAuthor.trim()}`
      }
      else {
        dwc.acceptedNameUsage = null
      }

      //identification terms
      let detAgent = currentDet.determiner || null
      if(detAgent) {
        dwc.identifiedBy = getFormattedAgent(detAgent)
      }
      else {
        dwc.identifiedBy = null
      }

      dwc.dateIdentified = getPartialDate(currentDet.determinedDate, currentDet.determinedDatePrecision)
      dwc.identificationCertainty = currentDet.confidence || null
      dwc.identificationReferences = null //TODO we need to know the custom field for this
      dwc.identificationRemarks = currentDet.remarks.trim() || null

    }
    else { // no name
      dwc.scientificName = null
      dwc.identificationQualifier = null
      dwc.taxonRank = null
      dwc.taxonomicStatus = null
      dwc.acceptedNameUsage = null
      dwc.identifiedBy = null
      dwc.dateIdentified = null
      dwc.identificationCertainty = null
      dwc.identificationReferences = null
      dwc.identificationRemarks = null
    }
  }
  else { // no current det
    dwc.scientificName = null
    dwc.identificationQualifier = null
    dwc.taxonRank = null
    dwc.taxonomicStatus = null
    dwc.acceptedNameUsage = null
    dwc.identifiedBy = null
    dwc.dateIdentified = null
    dwc.identificationCertainty = null
    dwc.identificationReferences = null
    dwc.identificationRemarks = null
  }

  //location fields
  //TODO country and stateProvince from the geography hierarchy
  dwc.verbatimLocality = fixString(typy(co, 'collectingevent.verbatimLocality').safeObject || null) //TODO there may also be a custom verbatim locality on the locality or collectionobject
  
  //for verbatimCoordinates we assume that we need both verbatim fields(sometimes one has a value but not the other)
  let verbatimLat = fixString(typy(co, 'collectingevent.locality.verbatimLatitude').safeObject || null)
  let verbatimLong = fixString(typy(co, 'collectingevent.locality.verbatimLongitude').safeObject || null)
  if (verbatimLat && verbatimLong) {
    dwc.verbatimCoordinates = `${verbatimLat.trim().toUpperCase()} ${verbatimLong.trim().toUpperCase()}` //uppercase because people capture the cardinal directions in lower case
  }
  else { //we use the lat and long text fields
    let latText = typy(co, 'collectingevent.locality.lat1Text').safeObject || null
    let longText = typy(co, 'collectingevent.locality.long1Text').safeObject || null
    if(latText && longText && latText.trim() && longText.trim()) {
      dwc.verbatimCoordinates = `${latText.trim().toUpperCase()} ${longText.trim().toUpperCase()}` //uppercase because people capture the cardinal directions in lower case
    }
  }
  //if we have it leave it, else null
  if (!dwc.verbatimCoordinates){
    dwc.verbatimCoordinates = null
  }
  
  //locality
  let locfields = []
  if(localityfields) {
    locfields = localityfields.split(',').map(fieldname => fieldname.trim())
  }
  else {   //default to the standard locality fields
    locfields = ['localityName', 'namedPlace', 'relationToNamedPlace']
  }

  let locStrings = []
  locfields.forEach(field => {
    locStrings.push(typy(co,`collectingevent.locality.${field}`).safeObject || null)
  })
  dwc.locality = locStrings
                    .map(string => fixString(string)) //collapse any white space strings to ''
                    .filter( string=> string) //remove any that are '' or null
                    .join(', ')

  //for coordinates, we assume we must have a verbatim coordinates value if there is are to be decimal coordinates
  if (dwc.verbatimCoordinates) {
    dwc.decimalLatitude = typy(co, 'collectingevent.locality.latitude1').safeObject
    dwc.decimalLongitude = typy(co, 'collectingevent.locality.longitude1').safeObject
    let details = typy(co, 'collectingevent.locality.georefDetails').safeObject || null
    if (details && Array.isArray(details) && details.length > 0) {
      let georef = details[0]
      let accuracy = georef.geoRefAccuracy
      if(accuracy){
        let units = georef.geoRefAccuracyUnits.trim()
        if(units) {
          if (['m', 'meter', 'meters'].includes(unit.toLowerCase())){
            dwc.coordinateUncertaintyInMeters = accuracy
          }
          else if (['mi', 'mile', 'miles'].includes(unit.toLowerCase())) {
            dwc.coordinateUncertaintyInMeters = accuracy / 1609,34
          }
          else if (['k', 'km', 'kilo', 'kilometer', 'kilometers'].includes(unit.toLowerCase())) {
            dwc.coordinateUncertaintyInMeters = accuracy / 1000
          }
          else {
            dwc.coordinateUncertaintyInMeters = '#err' //so we can pick up cases where we don't know what the unit is
          }
        }
      }

      dwc.verbatimSRS = georef.originalCoordSystem
      dwc.geodeticDatum = typy(co, 'collectingevent.locality.datum').safeObject || null
      dwc.georeferencedBy = getFormattedAgent(georef.geoRefAgent)
      dwc.georeferenceDate = georef.geoRefDetDate || null
      dwc.georeferenceProtocol = georef.protocol || null
      dwc.georeferenceSources = georef.source || null
      dwc.georeferenceRemarks = fixString(georef.geoRefRemarks || null)
      dwc.georeferenceVerificationStatus =  georef.geoRefVerificationStatus || null

    }
  }
  else {
    dwc.decimalLatitude = null
    dwc.decimalLongitude = null
    dwc.verbatimSRS = null
    dwc.geodeticDatum = null
    dwc.georeferencedBy = null
    dwc.georeferenceDate = null
    dwc.georeferenceProtocol = null
    dwc.georeferenceSources = null
    dwc.georeferenceRemarks = null
    dwc.georeferenceVerificationStatus = null
  }

  //the rest of the event terms

  //some some reason Specify splits the verbatim date!!
  let verbatimDate = typy(co, 'collectingevent.verbatimDate').safeObject || null
  if(verbatimDate && verbatimDate.trim()) {
    dwc.verbatimEventDate = fixString(verbatimDate)
  }
  else {
    let verbatimDates = [fixString(typy(co, 'collectingevent.startDateVerbatim').safeObject || null), fixString(typy(co, 'collectingevent.endDateVerbatim').safeObject || null)]
    dwc.verbatimEventDate = verbatimDates.filter(date => date).join(' - ')
  }
  //just check if created the property and make null if not
  if(!dwc.verbatimEventDate){
    dwc.verbatimEventDate = null
  }

  let startDate = typy(co, 'collectingevent.startDate').safeObject || null
  let startDatePrecision = typy(co, 'collectingevent.startDatePrecision').safeObject || null
  let endDate = typy(co, 'collectingevent.endDate').safeObject || null
  let endDatePrecision = typy(co, 'collectingevent.endDatePrecision').safeObject || null

  dwc.eventDate = getISODateRange(startDate, startDatePrecision, endDate, endDatePrecision)

  //we need to populate these appropriately
  dwc.year = null
  dwc.month = null
  dwc.day = null
  if(dwc.eventDate) {
    
    if(dwc.eventDate.includes('/')) { //its a range so we must consider both
      let rangeParts = dwc.eventDate.split('/')
      let startParts = rangeParts[0].split('-')
      let endParts = rangeParts[1].split('-')
      if(endParts.length == 1){
        dwc.year = startParts[0]
        dwc.month = startParts[1]
      }
      else if(endParts.length == 2){
        dwc.year = startParts[0]
      }
      //else all different and we cant populate anything
    }
    else {
      let dateParts = dwc.eventDate.split('-')
      if(dateParts[0]){
        dwc.year = dateParts[0]
      }
      if(dateParts[1]){
        dwc.month = dateParts[1]
      }
      if(dateParts[2]){
        dwc.day = dateParts[2] 
      }
    }
  }
  
  dwc.samplingProtocol = typy(co, 'collectingevent.method').safeObject || null

  //TODO dwc.habitat - needs the custom field from each database

  dwc.eventRemarks = fixString(typy(co, 'collectingEvent.remarks').safeObject || null)
  
  
  //finish off with the occurrence remarks
  dwc.occurrenceRemarks = fixString(co.Remarks.trim() || null)
  
}

module.exports = transformToDwc