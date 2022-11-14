import fetch from 'node-fetch';

export const fetchGBIFTaxon = async (name, restrictToRank, restrictToNames) => {
  const url = `https://api.gbif.org/v1/species?name=${name}`
  const response = await fetch(url)
  const json = await response.json()
  if(json.hasOwnProperty('results') && Array.isArray(json.results) && json.results.length){
    const candidates = json.results.filter(x => x.hasOwnProperty(restrictToRank) && restrictToNames.includes(x[restrictToRank]))
    if(candidates.length) {
      const taxon = candidates[0]
      return {name, taxon}
    }
    else {
      return {name, taxon: null}
    }
  }
  else {
    return {name, taxon: null}
  }
}

/**
 * 
 * @param {*} names A list of taxon names
 * @returns Object with taxon names as keys and results as object values
 */
export const getGlobalNamesTaxa = async (names) => {
  const url = `https://verifier.globalnames.org/api/v1/verifications`
      
  const callBody = {
    nameStrings: names,
    preferredSources: [1],
    withAllMatches: false,
    withCapitalization: false
  }
  
  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(callBody)
    })
  }
  catch(err) {
    throw err
  }
    
  let results
  try {
    results = await response.json() // this is an array
  }
  catch(err) {
    throw err
  }

  const result = {}

  for (const nameResults of results.names) { //horrible naming here
    result[nameResults.name] = nameResults.bestResult
  }

  return result

}

  // const output = []
  // const notFound = []
  // const similar = {}
  // for (const result of results.names) {
  //   if(result.bestResult) {
      
  //     if (result.bestResult.matchedCanonicalSimple != result.name) { //globalnames uses fuzzy matches
  //       similar[result.name] = result.bestResult.matchedCanonicalSimple
  //       continue
  //     }

  //     const outputObj = {}
  //     outputObj.name= result.name
      
  //     if(addAuthority) {
  //       outputObj.globalnamesAuthority = null
  //       // globalnames doesn't give the authority in it's own field(!!!), so we have to extract it
  //       const nameLastPart = result.name.split(' ').filter(x => x).pop()
  //       const matchedNameParts = result.bestResult.matchedName.split(' ').filter(x => x)
  //       const indexOfLastNamePart = matchedNameParts.indexOf(nameLastPart)
  //       if (indexOfLastNamePart >= 0 && matchedNameParts.length > indexOfLastNamePart) {
  //         outputObj.globalnamesAuthority = matchedNameParts.slice(indexOfLastNamePart + 1).join(' ')
  //       }
  //     }

  //     if(addCurrentName){
  //       outputObj.globalnamesAcceptedName = rest.bestResult.acceptedName
  //     }


  //     if(targetRanks){
  //       if(result.bestResult.classificationRanks && result.bestResult.classificationPath){
  //         const ranks = result.bestResult.classificationRanks.split('|')
  //         const names = result.bestResult.classificationPath.split('|')
  
  //         //make a classification object
  //         const classification = {}
  //         while(ranks.length && names.length) {
  //           const rank = ranks.pop()
  //           const name = names.pop()
  //           classification[rank.toLowerCase()] = name
  //         }
  
  //         if(classification[restrictToRank] && restrictToNames.includes(classification[restrictToRank])){
            
  //           for (const targetRank of targetRanks) {
  //             outputObj[targetRank] = classification[targetRank] || null
  //           }
  
  //           output.push(outputObj)

  //         }
  //         else {
  //           notFound.push(result.name)
  //         }
  //       }
  //       else{
  //         notFound.push(result.name)
  //       }
  //     }
  //     else {
  //       output.push(outputObj)
  //     }
  //   }
  //   else {
  //     notFound.push(result.name)
  //   }
  // }