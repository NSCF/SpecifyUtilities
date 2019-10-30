let conn = require('./sequelizeconn')
let configs = require('./dbconfigs')


let dnsm = conn(configs['dnsm'])
let ditsong = conn(configs['distong'])
let amathole = conn(configs['amathole'])
let bayworld = conn(configs['bayworld'])
let elmuseum = conn(configs['elmuseum'])
let mmk = conn(configs['mmk'])
let kznm = conn(configs['kznm'])


module.exports = {
  dnsm,
  ditsong,
  amathole,
  bayworld,
  elmuseum,
  mmk,
  kznm
}
