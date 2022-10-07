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

export const getGlobalNamesTaxa = async (names, targetRanks, restrictToRank, restrictToNames) => {
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
    console.error('error calling globalnames:', err.message)
    process.exit()
  }
    
  let results
  try {
    results = await response.json() // this is an array
  }
  catch(err) {
    console.error('error parsing json:', err.message)
    process.exit()
  }

  const output = []
  const notFound = []
  for (const result of results.names) {
    if(result.bestResult) {
      if(result.bestResult.classificationRanks && result.bestResult.classificationPath){
        const ranks = result.bestResult.classificationRanks.split('|')
        const names = result.bestResult.classificationPath.split('|')

        //make a classification object
        const classification = {}
        while(ranks.length && names.length) {
          const rank = ranks.pop()
          const name = names.pop()
          classification[rank.toLowerCase()] = name
        }

        if(classification[restrictToRank] && restrictToNames.includes(classification[restrictToRank])){
          
          const outputObj = {}
          
          for (const targetRank of targetRanks) {
            outputObj[targetRank] = classification[targetRank] || null
          }

          outputObj.name= result.name

          output.push(outputObj)
        }
        else {
          notFound.push(result.name)
        }
      }
      else{
        notFound.push(result.name)
      }
    }
    else {
      notFound.push(result.name)
    }
  }

  return {
    output, 
    notFound
  }
}