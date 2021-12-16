/**
 * Takes an aggregated string of collector names, in multiple formats, and splits and standardizes them as required by the Specify workbench
 * @param {String} collectors String of collector names, possibily with titles, separated by ; or | or &
 * @returns Array of collector objects
 */
export default function splitCollectors(collectors) {

  //handle nulls
  if(!collectors || !collectors.trim()){
    return []
  }
  
  //make it an array 
  collectors = collectors.split(/[;|\&]/).filter(x => x).map(x => x.trim()).filter(x => x)

  const collectorObjects = []

  for (const collector of collectors){
    const obj = makeCollectorObject(collector)
    collectorObjects.push(obj)
  }

  return collectorObjects
}

function makeCollectorObject(collector) {
  const titles = [
    '^Dr\\.?\\s+',
    '^Mr\\.?\\s+',
    '^Mnr\\.?\\s+',
    '^Ms\\.?\\s+',
    '^Mrs\\.?\\s+',
    '^Prof\\.?\\s+',
    '^Mev\\.?\\s+',
    '^Mej\\.?\\s+',
    '^Kapt\\.?\\s+',
    '^Rev\\.?\\s+',
  ]

  const specialSurnames = [
    'van',
    'der',
    'de',
    'te'
  ]

  const obj = {
    title: null,
    firstName: null,
    lastName: null,
    initials: null, 
    institution: null
  }

  //first get the title and remove from the collector if present
  for (const title of titles) {
    let re = new RegExp(title, 'i')
    if(re.test(collector)) {
      obj.title = collector.slice(0, collector.indexOf(' '))
      collector = collector.slice(collector.indexOf(' ') + 1)
      break
    }
  }

  //are there parts or only one name
  if(collector.includes(',')) {
    let parts = collector.split(',').filter(x => x).map(x => x.trim()).filter(x => x)
    if(parts.length > 2) {
      console.error('error with collect name:', collector)
      return
    }
    //check for initials
    if(/^[A-Z\.]+$/.test(parts[0])) {
      obj.initials = parts[0]
      obj.lastName = parts[1]
      return obj
    }
    
    if(/^[A-Z\.]+$/.test(parts[1])) {
      obj.initials = parts[1]
      obj.lastName = parts[0]
      return obj
    }

    //else
    obj.lastName = parts[0]
    obj.firstName = parts[1]
    obj.initials = obj.firstName.charAt(0) + '.'

    return obj
  }
  else {
    if(collector.includes(' ')) {
      if(/^[A-Z\.]+\s+/.test(collector)) { //capitals followed by a space, so initials
        obj.initials = collector.slice(0, collector.indexOf(' '))
        obj.lastName = collector.slice(collector.indexOf(' ') + 1)
        return obj
      }
      else {
        //it might end with initials
        if(/\s+[A-Z\.]+$/.test(collector)) { //it ends with initials
          let parts = collector.split(/\s+/)
          obj.initials = parts.pop()
          obj.lastName = parts.join(' ')
          return obj
        }
        else if (specialSurnames.includes(collector.slice(0, collector.indexOf(' ')).toLowerCase())){ //catch the van, de, etc surnames
          obj.lastName = collector
          return obj
        }
        else if(/[A-Z]/.test(collector.charAt(0))) { //the first part of the name is upper case so we assume it's a firstname
          obj.firstName = collector.slice(0, collector.indexOf(' '))
          obj.initials = obj.firstName.charAt(0) + '.'
          obj.lastName = collector.slice(collector.indexOf(' ') + 1)
          return obj
        }
        else { //it's a lowercase letter to start, so it must be du, der, van, etc, therefore it's a surname
          obj.lastName = collector
          return obj
        }
      } 
    }
    else { //no spaces, so presumably just a lastName
      obj.lastName = collector
      return obj
    }
  }
}
