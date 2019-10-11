let {t: typy} = require('typy') //for working with deeply nested models. See https://dev.to/flexdinesh/accessing-nested-objects-in-javascript--9m4

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
  
  //TODO add the paleocontext stuff for paleao collections
  
  dwc = {}

  //record level fields
  dwc.occurrenceID = co.GUID || null //TODO add the Griscoll stuff also - needs to be a resolvable GUID
  dwc.institutionID = typy(co, 'collection.discipline.division.institution.uri').safeObject || null //TODO this needs confirmation
  //dwc.collectionID = typy(co, 'collection.GUID').safeObject || null //TODO confirm this too
  dwc.basisOfRecord = 'PreservedSpecimen' //because it's all museums

  dwc.accessRights = null
  let rightsFields = [
    typy(co, 'collection.discipline.division.institution.termsOfUse').safeObject || null,
    typy(co, 'collection.discipline.division.institution.copyright').safeObject || null,
    typy(co, 'collection.discipline.division.institution.ipr').safeObject || null
  ].filter(val => val && val.trim())
  if(rightsFields.length > 0) {
    dwc.accessRights = rightsFields.join(' | ')
  }
  
  dwc.licence = typy(co, 'collection.discipline.division.institution.licence').safeObject || null
  dwc.ownerInstitutionCode = null //TODO this needs to be resolved with Specify. Will be an if statement on whether owner institution exists and is different to institution code
  
  dwc.modified = null
  if(co.timestampModified) {
    dwc.modified = co.timestampModified.toISOString()
  }
  
  dwc.institutionCode = typy(co, 'collection.discipline.division.institution.code').safeObject || null
  dwc.collectionCode = typy(co, 'collection.code').safeObject || null
  
  //occurrence terms
  let catNum = co.catalogNumber || null
  if(catNum && typeof catNum == 'string'){
    catNum = catNum.replace(/^0+/, '')
  }
  dwc.catalogNumber = catNum //TODO how to build the catalog number for each collection; use .replace(/^0+/, '') to remove leading zeros
  if(co.altCatalogNumber && co.altCatalogNumber.trim()){
    dwc.otherCatalogNumbers = co.altCatalogNumber.replace(/,/g, ' | ').replace(/;/g, ' | ').replace(/\//g, ' | ').replace(/\s+/g, ' ')
  }
  else {
    dwc.otherCatalogNumbers = null
  }
  dwc.recordNumber = co.fieldNumber || null
  dwc.fieldNumber = typy(co, 'collectingEvent.stationFieldNumber').safeObject || null //this is an Event field but its here with the other similar fields
  var collectors = typy(co, 'collectingEvent.collectors').safeObject ||  null
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

  //TODO sex and lifeStage - these will be custom fields on every database. See https://github.com/tdwg/dwc/issues/36 for explanation what goes into these. 

  dwc.preparations = getPrepartions(co) || null
  //dwc.associatedMedia = null //TODO complete getAssociatedMedia(). I think this might have to come from Flickr
  
  //taxon and determination terms

  dwc.kingdom = null
  dwc.phylum = null
  dwc.class = null
  dwc.order = null
  dwc.family = null
  dwc.genus = null
  dwc.subgenus = null
  dwc.specificEpithet = null
  dwc.infraspecificEpithet = null

  dwc.scientificName = null
  dwc.scientificNameAuthorship = null
  dwc.identificationQualifier = null
  dwc.taxonRank = null
  dwc.taxonomicStatus = null
  dwc.typeStatus =  null
  dwc.acceptedNameUsage = null
  dwc.identifiedBy = null
  dwc.dateIdentified = null
  dwc.basisOfIdentification = null
  dwc.identificationCertainty = null
  dwc.identificationReferences = null
  dwc.identificationRemarks = null

  //dwc.scientificName
  var currentDet = co.determinations.find(det => det.isCurrent) //we assume there is always a current det, but there may not be!
  if(currentDet) { 
    let name = typy(currentDet, 'dettaxon.fullName').safeObject || ""
    let author = typy(currentDet, 'dettaxon.author').safeObject || ""
    let rank = typy(currentDet, 'dettaxon.rank.Name').safeObject || ""
    let qualifier = currentDet.qualifier || ""
    let accepted = typy(currentDet, 'dettaxon.isAccepted').safeObject || true //we don't want accidental falsy values here
    
    if(name){ //this should always be the case
      
      //add the taxon ranks
      let terms = Object.keys(dwc)
      if(terms.includes(rank.toLowerCase())){
        dwc[rank.toLowerCase()] = name
      }
      else if(rank == 'Species'){
        dwc.specificEpithet = typy(currentDet, 'dettaxon.name').safeObject || null
      }
      else if(rank == "Subspecies"){
        dwc.infraspecificEpithet = typy(currentDet, 'dettaxon.name').safeObject || null
      }

      //now ancestors
      currentDet.dettaxon.ancestors.forEach(ancestorTaxon => {
        let ancestorName = ancestorTaxon.fullName
        let ancestorRank = ancestorTaxon.rank.Name
        if(terms.includes(ancestorRank.toLowerCase())){
          dwc[ancestorRank.toLowerCase()] = ancestorName
        }
        else if(rank == 'Species'){
          dwc.specificEpithet = ancestorName
        }
        else if(rank == "Subspecies"){
          dwc.infraspecificEpithet = ancestorName
        }
      })

      let scientificName = name.trim()
      if(author) {
        scientificName = `${scientificName} ${author.trim()}`
        dwc.scientificNameAuthorship = author.trim()
      }
      dwc.scientificName = scientificName
      dwc.identificationQualifier = qualifier //this is an identification term
      dwc.taxonRank = rank.toLowerCase()
      dwc.taxonomicStatus = accepted? 'accepted' : 'invalid' //Specify only records accepted or not, no other categories for taxonomicStatus unless recorded in a custom field

      //acceptedNameUsage
      if(!accepted) {
        let acceptedName = typy(currentDet, 'dettaxon.acceptedTaxon.fullName').safeObject || ""
        let acceptedAuthor = typy(currentDet, 'dettaxon.acceptedTaxon.author').safeObject || ""
        if(acceptedName && acceptedName.trim()){
          if(acceptedAuthor && acceptedAuthor.trim()){
            dwc.acceptedNameUsage = `${acceptedName.trim()} ${acceptedAuthor.trim()}`
          }
          else {
            dwc.acceptedNameUsage = acceptedName.trim()
          }
        }
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
      //TODO basisOfIdentification from a custom field
      dwc.identificationCertainty = currentDet.confidence || null
      dwc.identificationReferences = null //TODO we need to know the custom field for this
      if(currentDet.remarks && currentDet.remarks.trim()) {
        dwc.identificationRemarks = currentDet.remarks.trim()
      }
    }
  }

  //the type status
  let typedets = co.determinations.filter(det => det.typeStatusName && det.typeStatusName.trim())
  if(typedets.length > 0) {
    let typestrings = []
    typedets.forEach(det =>{
      let typetaxonname = typy(currentDet, 'dettaxon.fullName').safeObject || ""
      let author = typy(currentDet, 'dettaxon.author').safeObject || ""
      typestrings.push(`${det.typeStatusName.trim()} of ${typetaxonname} ${author}`.trim())
    })
    dwc.typeStatus = typestrings.join(' | ')
  }
  
  //location fields

  //country and stateProvince from the geography hierarchy

  dwc.continent = null
  /*
  //TODO find out if these are used anywhere. Checked all databases I have access to, and asked Albe. Possibly only SAIAB.
  dwc.waterBody  = null
  dwc.islandGroup = null
  dwc.island  = null
  */
  dwc.country = null
  dwc.stateProvince = null
  dwc.county = null

  let basegeo = typy(co, 'collectingEvent.locality.geography').safeObject || null
  if(basegeo){
    let level = typy(basegeo, 'level.name').safeObject || null
    if(level){
      if(level == 'state'){
        dwc.stateProvince = basegeo.name
      }
      else if(['continent', 'country', 'county'].includes(level)){
        dwc[level] = basegeo.name
      }
    }
    
    //and it's ancestors
    basegeo.ancestors.forEach(ancestorgeo => {
      let level = typy(ancestorgeo, 'level.name').safeObject || null
      if(level){
        if(level == 'state'){
          dwc.stateProvince = ancestorgeo.name
        }
        else if(['continent', 'country', 'county'].includes(level)){
          dwc[level] = ancestorgeo.name
        }
      }
    })
  }
  
  dwc.verbatimLocality = fixString(typy(co, 'collectingEvent.verbatimLocality').safeObject || null) //TODO there may also be a custom verbatim locality on the locality or collectionobject
  
  //for verbatimCoordinates we assume that we need both verbatim fields(sometimes one has a value but not the other)
  let verbatimLat = fixString(typy(co, 'collectingEvent.locality.verbatimLatitude').safeObject || null)
  let verbatimLong = fixString(typy(co, 'collectingEvent.locality.verbatimLongitude').safeObject || null)
  if (verbatimLat && verbatimLong) {
    dwc.verbatimCoordinates = `${verbatimLat.trim().toUpperCase()} ${verbatimLong.trim().toUpperCase()}` //uppercase because people capture the cardinal directions in lower case
  }
  else { //we use the lat and long text fields
    let latText = typy(co, 'collectingEvent.locality.lat1Text').safeObject || null
    let longText = typy(co, 'collectingEvent.locality.long1Text').safeObject || null
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
    locfields = localityfields.split(',').map(fieldname => {
      if(fieldname && fieldname.trim()) {
        return fieldname.trim()
      }
      else {
        return null
      }
    })
    //TODO we might need a case sensitive way of finding the field names here
  }
  else {   //default to the standard locality fields
    locfields = ['localityName', 'namedPlace', 'relationToNamedPlace']
  }

  let locStrings = []
  locfields.forEach(field => {
    locStrings.push(typy(co,`collectingEvent.locality.${field}`).safeObject || null)
  })
  dwc.locality = locStrings
                    .map(string => fixString(string)) //collapse any white space strings to ''
                    .filter(string => string) //remove any that are '' or null
                    .join(', ')

  //elevation/depth fields
  dwc.verbatimElevation = null
  dwc.minimumElevationInMeters = null
  dwc.maximumElevationInMeters = null
  dwc.verbatimElevation = null
  dwc.minimumDepthInMeters = null
  dwc.maximumDepthInMeters = null
  dwc.verbatimDepth = null
  
  let elevationAccuracy = typy(co,`collectingEvent.locality.elevationAccuracy`).safeObject || null
  let originalElevationUnit = typy(co,`collectingEvent.locality.originalElevationUnit`).safeObject || null
  let maxElevation = typy(co,`collectingEvent.locality.maxElevation`).safeObject || null
  let minElevation = typy(co,`collectingEvent.locality.minElevation`).safeObject || null
  let verbatimElevation = typy(co,`collectingEvent.locality.verbatimElevation`).safeObject || null
  
  //TODO we need a flag for marine collections to record depth. For now I've just added terrestrial collections
  //TODO this also needs to be tested for depth values which are recorded as negative
  let verbatim = null
  let max = null
  let min = null
  let elevAccuracy = null

  if(verbatimElevation && verbatimElevation.trim()) {
    verbatim = verbatimElevation.trim()
  }

  if(maxElevation || minElevation){
    if(maxElevation && minElevation){
      max = maxElevation
      min = minElevation
    }
    else if(maxElevation){
      if(elevationAccuracy){
        max = maxElevation + elevationAccuracy
        min = maxElevation - elevationAccuracy
      }
      else {
        max = maxElevation
        min = maxElevation
      }
    }
    else{
      if(elevationAccuracy){
        max = minElevation + elevationAccuracy
        min = minElevation - elevationAccuracy
      }
      else {
        max = minElevation
        min = minElevation
      }
    }
  }
  else {
    if(verbatimElevation && verbatimElevation.trim() && /-?\d+/.test(verbatimElevation)){ 
      if(verbatimElevation.includes('+/-') || verbatimElevation.includes('+-')){//a range is indicated in the verbatim string
        let elevParts = verbatimElevation.split('+/-')
        if(elevParts.length == 1){
          elevParts = verbatimElevation.split('+-')
        }
        verbatim = elevParts[0].match(/-?\d+/)[0] //it might be negative
        elevAccuracy = elevParts[1].match(/\d+/)[0]
        if(elevAccuracy) {
          max = verbatim + elevAccuracy
          min = verbatim - elevAccuracy
        }
        else {
          max = verbatim
          min = verbatim
        }
      }
      else { //its just a number
        max = verbatimElevation.match(/-?\d+/)[0]
        min = max
      }
    }
  }

  //remember the calculation from feet to meters
  let isFeet = verbatimElevation && verbatimElevation.toLowerCase().includes('f')
  if(!isFeet){
    isFeet = originalElevationUnit && originalElevationUnit.toLowerCase().includes('f')
  }
  if( isFeet ){
    max = Math.round(max * 0.3048)
    min = Math.round(min * 0.3048)
  }
  //TODO now just add in the relevant fields

  //for coordinates, we assume we must have a verbatim coordinates value if there is are to be decimal coordinates
  if (dwc.verbatimCoordinates) {
    dwc.decimalLatitude = typy(co, 'collectingEvent.locality.latitude1').safeObject
    dwc.decimalLongitude = typy(co, 'collectingEvent.locality.longitude1').safeObject
    let details = typy(co, 'collectingEvent.locality.georefDetails').safeObject || null
    if (details && Array.isArray(details) && details.length > 0) {
      let georef = details[0]
      
      //accuracy first
      let accuracy = georef.geoRefAccuracy || georef.maxUncertaintyEst
      if(accuracy){
        let units = georef.geoRefAccuracyUnits || georef.maxUncertaintyEstUnit
        if(units) {
          units = units.trim()
          if (['m', 'meter', 'meters'].includes(georef.maxUncertaintyEst.toLowerCase())){
            dwc.coordinateUncertaintyInMeters = accuracy
          }
          else if (['mi', 'mile', 'miles'].includes(units.toLowerCase())) {
            dwc.coordinateUncertaintyInMeters = (accuracy / 1609.34)
          }
          else if (['k', 'km', 'kilo', 'kilometer', 'kilometers'].includes(units.toLowerCase())) {
            dwc.coordinateUncertaintyInMeters = accuracy / 1000
          }
          else {
            dwc.coordinateUncertaintyInMeters = '#err' //so we can pick up cases where we don't know what the unit is
          }
        }
        else {
          dwc.coordinateUncertaintyInMeters = '#err' //so we can pick up cases where we don't know what the unit is
        }
      }

      dwc.verbatimSRS = georef.originalCoordSystem
      dwc.geodeticDatum = typy(co, 'collectingEvent.locality.datum').safeObject || null
      dwc.georeferencedBy = getFormattedAgent(georef.geoRefAgent)
      dwc.georeferencedDate = georef.geoRefDetDate || null
      dwc.georeferenceProtocol = georef.protocol || null
      dwc.georeferenceSources = typy(co, 'collectingEvent.locality.latlongMethod').safeObject || georef.source || null
      dwc.georeferenceRemarks = fixString(georef.geoRefRemarks || null)
      if (georef.noGeoRefBecause && georef.noGeoRefBecause.trim()) {
        dwc.georeferenceRemarks += ` | ${fixString(georef.noGeoRefBecause)}`
      }
      dwc.georeferenceVerificationStatus =  georef.geoRefVerificationStatus || null

    }
  }
  else {
    dwc.decimalLatitude = null
    dwc.decimalLongitude = null
    dwc.coordinateUncertaintyInMeters = null
    dwc.verbatimSRS = null
    dwc.geodeticDatum = null
    dwc.georeferencedBy = null
    dwc.georeferencedDate = null
    dwc.georeferenceProtocol = null
    dwc.georeferenceSources = null
    dwc.georeferenceRemarks = null
    dwc.georeferenceVerificationStatus = null
  }

  //the rest of the event terms

  //some some reason Specify splits the verbatim date!!
  let verbatimDate = typy(co, 'collectingEvent.verbatimDate').safeObject || null
  if(verbatimDate && verbatimDate.trim()) {
    dwc.verbatimEventDate = fixString(verbatimDate)
  }
  else {
    let verbatimDates = [fixString(typy(co, 'collectingEvent.startDateVerbatim').safeObject || null), fixString(typy(co, 'collectingEvent.endDateVerbatim').safeObject || null)]
    dwc.verbatimEventDate = verbatimDates.filter(date => date).join(' - ')
  }
  //just check if created the property and make null if not
  if(!dwc.verbatimEventDate){
    dwc.verbatimEventDate = null
  }

  let startDate = typy(co, 'collectingEvent.startDate').safeObject || null
  let startDatePrecision = typy(co, 'collectingEvent.startDatePrecision').safeObject || null
  let endDate = typy(co, 'collectingEvent.endDate').safeObject || null
  let endDatePrecision = typy(co, 'collectingEvent.endDatePrecision').safeObject || null

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
  
  dwc.samplingProtocol = typy(co, 'collectingEvent.method').safeObject || null

  //TODO dwc.habitat - needs the custom field from each database

  dwc.eventRemarks = fixString(typy(co, 'collectingEvent.remarks').safeObject || null)
  
  
  //finish off with the occurrence remarks
  dwc.occurrenceRemarks = fixString(co.Remarks || null)

  //add namespaces if wanted
  if(includeNamespaces){
    let dcterms = ['type', 'modified', 'language', 'licence', 'rightsHolder', 'accessRights', 'bibliographicCitation', 'references']

    let dwcterms = ['	type', 'modified', 'language', 'license', 'rightsHolder', 'bibliographicCitation', 'references', 'datasetID', 
    'datasetName', 'informationWithheld', 'dataGeneralizations', 'dynamicProperties', 'individualCount', 'reproductiveCondition', 
    'behavior', 'establishmentMeans', 'occurrenceStatus', 'disposition', 'associatedReferences', 'associatedSequences', 'associatedTaxa', 
    'organismID', 'organismName', 'organismScope', 'associatedOccurrences', 'associatedOrganisms', 'previousIdentifications', 
    'organismRemarks', 'materialSampleID', 'eventID', 'parentEventID', 'eventTime', 'startDayOfYear', 'endDayOfYear', 'year', 'month', 'day', 
    'sampleSizeValue', 'sampleSizeUnit', 'samplingEffort', 'fieldNotes', 'locationID', 'higherGeographyID', 'higherGeography', 'continent', 
    'waterBody', 'islandGroup', 'island', 'countryCode', 'county', 'municipality', 'minimumElevationInMeters', 'maximumElevationInMeters', 
    'minimumDepthInMeters', 'maximumDepthInMeters', 'minimumDistanceAboveSurfaceInMeters', 'maximumDistanceAboveSurfaceInMeters', 
    'locationAccordingTo', 'locationRemarks', 'coordinatePrecision', 'pointRadiusSpatialFit', 'verbatimLatitude', 'verbatimLongitude', 
    'verbatimCoordinateSystem', 'footprintWKT', 'footprintSRS', 'footprintSpatialFit', 'geologicalContextID', 'lithostratigraphicTerms', 
    'identificationID', 'taxonID', 'scientificNameID', 'acceptedNameUsageID', 'parentNameUsageID', 'originalNameUsageID', 'nameAccordingToID', 
    'namePublishedInID', 'taxonConceptID', 'acceptedNameUsage', 'parentNameUsage', 'originalNameUsage', 'nameAccordingTo', 'namePublishedIn', 
    'namePublishedInYear', 'higherClassification', 'infraspecificEpithet', 'verbatimTaxonRank', 'vernacularName', 'nomenclaturalCode', 
    'nomenclaturalStatus', 'taxonRemarks', 'measurementID', 'measurementType', 'measurementValue', 'measurementAccuracy', 'measurementUnit', 
    'measurementDeterminedBy', 'measurementDeterminedDate', 'measurementMethod', 'measurementRemarks', 'resourceRelationshipID', 'resourceID', 
    'relatedResourceID', 'relationshipOfResource', 'relationshipAccordingTo', 'relationshipEstablishedDate', 'relationshipRemarks', 
    'earliestGeochronologicalEra', 'fromLithostratigraphicUnit', 'latestGeochronologicalEra', 'occurrenceID', 'institutionID', 'collectionID', 
    'institutionCode', 'collectionCode', 'basisOfRecord', 'accessRights', 'ownerInstitutionCode', 'modified', 'catalogNumber', 'otherCatalogNumbers', 
    'kingdom', 'phylum', 'class', 'order', 'family', 'genus', 'subgenus', 'specificEpithet', 'infraspecificEpithet', 'taxonRank', 'scientificName', 
    'scientificNameAuthorship', 'typeStatus', 'taxonomicStatus', 'identificationQualifier', 'identifiedBy', 'dateIdentified', 'identifierExpertise', 
    'identificationReferences', 'identificationRemarks', 'country', 'stateProvince', 'locality', 'verbatimLocality', 
    'verbatimCoordinates', 'verbatimSRS', 'verbatimElevation', 'verbatimDepth', 'earliestEonOrLowestEonothem', 'latesEonOrHighestEonothem', 
    'earliestEraOrLowestErathem', 'latestEraOrHighestErathem', 'earliestPeriodOrLowestSystem', 'latestPeriodOrHighestSystem', 'earliestEpochOrLowestSeries', 
    'latestEpochOrHighestSeries', 'earliestAgeOrLowestStage', 'latestAgeOrHighestStage', 'lowestBiostratigraphicZone', 'highestBiostratigraphicZone', 
    'group', 'formation', 'member', 'bed', 'decimalLatitude', 'decimalLongitude', 'geodeticDatum', 'coordinateUncertaintyInMeters', 
    'georeferencedBy', 'georeferencedDate', 'georeferenceProtocol', 'georeferenceSources', 'georeferenceRemarks', 'georeferenceVerificationStatus', 
    'eventDate', 'verbatimEventDate', 'recordedBy', 'recordNumber', 'fieldNumber', 
    'samplingProtocol', 'habitat', 'eventRemarks', 'organismQuantity', 'organismQuantityType', 'sex', 'lifeStage', 'preparations', 'occurrenceRemarks', 'associatedMedia']
    
    Object.keys(dwc).forEach(key => {
      if(dcterms.includes(key)){
        dwc[`dcterms:${key}`] = dwc[key]
        delete dwc[key]
      }
      else if(dwcterms.includes(key)) {
        dwc[`dwc:${key}`] = dwc[key]
        delete dwc[key]
      }
    })
  }

  return dwc
}

module.exports = transformToDwc