import fetch from 'node-fetch';

export const fetchGBIFTaxon = async (name, restrictToRank, restrictToName) => {
  const url = `https://api.gbif.org/v1/species?name=${name}`
  const response = await fetch(url)
  const json = await response.json()
  if(json.hasOwnProperty('results') && Array.isArray(json.results) && json.results.length){
    const candidates = json.results.filter(x => x.hasOwnProperty(restrictToRank) && x[restrictToRank] == restrictToName)
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