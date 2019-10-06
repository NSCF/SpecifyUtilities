This directory contains the Specify models corresponding to the tables with the same names.
Models can be scaffolded using sequelize-auto, see [https://github.com/sequelize/sequelize-auto](https://github.com/sequelize/sequelize-auto)
This might also be helpful when the database schema is updated with new versions.

###Examples
`sequelize-auto -h localhost -d sptaxontree -u ian -x regalis -p 3306  -e mysql -o "./models" -t "discipline,taxontreedefitem,specifyuser" -C`

Unfortunately you need to `npm install mysql` first because it uses a different library to sequelize for accessing the MySQL database

##Note!!
I've then changed some of the unspecified field names to the fields we need for the taxon tree, see taxon.js. We should also specify here what fields we will use for the species pages.