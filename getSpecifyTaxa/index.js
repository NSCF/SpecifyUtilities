//extract taxa from Specify into a csv
//I'm doing this because I want multiple ranks and I want the full dataset without fiddling in MySQL workbench

import csv from 'fast-csv';
import * as mysql from 'mysql'

const conn = mysql.createConnection({
  host     : 'specify.saiab.ac.za',
  user     : 'elmuseumituser',
  password : '1Little-Port!Elizabeth',
  database : 'elmuseum'
});

//SCRIPT

const sql = `select t.taxonid, t.fullname, t.Author from taxon t
join taxontreedefitem tti on t.TaxonTreeDefItemID = tti.TaxonTreeDefItemID
join taxontreedef ttd on t.TaxonTreeDefID = ttd.TaxonTreeDefID
join discipline d on d.TaxonTreeDefID = ttd.TaxonTreeDefID
where (tti.name = 'species' or tti.name = 'subspecies') and d.name = 'Invertebrate Zoology'`

conn.query(sql, (err, results, fields) => {
  if(err) {
    console.error('error reading database:', err.message)
    return
  }

  //else
  const fileName = 'elm_malacology_taxa.csv'
  csv.writeToPath(fileName, results, {headers: true})
  .on('error', err => console.error(err))
  .on('finish', () => {
    console.log('All done...')
    process.exit()
  });
})
