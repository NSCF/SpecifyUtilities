const {t:typy} = require('typy')

//helper functions
/**
 * Flattens collectors into dwc.recordedBy as lastName, initials, eg Smith, J.E.
 * @param {Array} collectors An array of Agent objects
 */

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
  if(firstName && firstName.trim()){
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
  else if (middleInitial && middleInitial.trim()){
    if(middleInitial && middleInitial.match(allCapsRegex)){
      return middleInitial.replace(/\s/g, '').replace(/\./g, '').split('').join('.') + "."
    }
  }

  return "" //case with no initials
}

function getFormattedAgent(Agent){
  if(Agent) {
    let initials = getInitials(Agent.firstName, Agent.initials, Agent.middleInitial)
    if (initials){
      if(Agent.lastName && Agent.lastName.trim()){
        return `${Agent.lastName.trim()}, ${initials}`
      }
      else {
        return initials
      }
    }
    
    //else
    if(Agent.lastName && Agent.lastName.trim()){
      return Agent.lastName.trim()
    }
  
    //else 
    return null
  }
  else {
    return null
  }
  
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

      return preps.reduce((a,b,) => a.countAmt + b.countAmt, 0)
      
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
      if(type && type.trim()) {
        if(type.toLowerCase().includes('corpse')) {
          type = 'whole specimen/s'
        }
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

function getAssociatedMedia(co){
  return null
}

function getPartialDate(date, dateprecision){

  if(!date) { //no date
    return null
  }
  
  if(typeof date == 'object') {
    date = date.toISOString().split('T')[0] //gives us just the date part
  }

  // in Specify 1 is full date, 2 is month, 3 is year
  if(dateprecision == 1) {
    return date
  }

  let dateParts = date.split('-')

  if(dateprecision == 2) {
    dateParts.pop()
    return dateParts.join('-')
  }

  //implicit else, dateprecision is 3
  return dateParts[0]

}

function getISODateRange(startDate, startDatePrecision, endDate, endDatePrecision){
  
  if(!startDate){ //we need this at least
    return null
  }

  //first scenario, no enddate or startdate == enddate, simple
  if(!endDate || startDate == endDate){
    return getPartialDate(startDate, startDatePrecision)
  }

  //error check
  if(endDate < startDate) {
    return '#err'
  }
  
  let dateprecision = Math.max(startDatePrecision, endDatePrecision) //we assume they have to have the same precision, so if one is a year, the other must be a year

  if(typeof startDate == "object") {
    startDate = startDate.toISOString().split('T')[0]
  }

  if(typeof endDate == 'object') {
    endDate = endDate.toISOString().split('T')[0]
  }
  
  let startDateParts = startDate.split('-')
  let endDateParts = endDate.split('-')

  if(dateprecision == 3){ //year precision
    if(startDateParts[0] == endDateParts[0]){
      return startDateParts[0]
    }
    else {
      return `${startDateParts[0]}/${endDateParts[0]}`
    }
  }
  else if (dateprecision == 2){ //month precision
    if(startDateParts[0] == endDateParts[0]){
      if(startDateParts[1] == endDateParts[1]) {
        startDateParts.pop()
        return startDateParts.join('-')
      }
      else {
        return `${startDateParts[0]}-${startDateParts[1]}/${endDateParts[1]}`
      }
    }
    else {
      startDateParts.pop()
      endDateParts.pop()
      return `${startDateParts.join('-')}/${endDateParts.join('-')}`
    }
  }
  else { //full dates
    //we already know the dates are not the same, so we only need to check year and month
    if(startDateParts[0] == endDateParts[0]){
      if(startDateParts[1] == endDateParts[1]){
        return `${startDate}/${endDateParts[2]}`
      }
      else {
        return `${startDate}/${endDateParts.splice(1).join('-')}`
      }
    }
    else {
      return `${startDate}/${endDate}`
    }
  }
}

function fixString(s) {
  if(s && s.trim()){
    s = s.trim()
    if(s[s.length - 1] == '.'){
      s = s.slice(0,-1) //nice
    }
    s = s.replace(/\s+/g, " ")
  }

  return s

}

module.exports = {
  getFormattedAgent,
  getOrganismQuantity,
  getPrepartions,
  getAssociatedMedia,
  getPartialDate,
  getISODateRange,
  fixString
}