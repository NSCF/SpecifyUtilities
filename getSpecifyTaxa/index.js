//extract taxa from Specify into a csv
//I'm doing this because I want multiple ranks and I want the full dataset without fiddling in MySQL workbench

import * as util from 'util';
import csv from 'fast-csv';
import * as mysql from 'mysql'

const conn = mysql.createConnection({
  host     : 'specify.saiab.ac.za',
  user     : '1Little-Port!Elizabeth',
  password : '1Little-Port!Elizabeth',
  database : 'elmuseum'
});

//SCRIPT
const query = util.promisify(conn.query)

const sql = `select t.taxonid, t.fullname, t.Author, tti.name from taxon t
join taxontreedefitem tti on t.TaxonTreeDefItemID = tti.TaxonTreeDefItemID
join taxontreedef ttd on t.TaxonTreeDefID = ttd.TaxonTreeDefID
join discipline d on d.TaxonTreeDefID = ttd.TaxonTreeDefID
where (tti.name = 'species' or tti.name = 'subspecies') and d.name = 'Invertebrate Zoology'`

query(sql).then(results => {
  const fileName = 'elm_malacology_taxa.csv'
  csv.writeToPath(fileName, results, {headers: true})
  .on('error', err => console.error(err))
  .on('finish', () => {
    console.log('All done...')
    process.exit()
  });
}).catch(err => console.log('error reading database:', err.message))
