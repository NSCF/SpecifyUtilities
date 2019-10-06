//modified from https://github.com/sequelize/express-example
//this is the database interface


'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('Sequelize')
var basename  = path.basename(__filename); // so we exclude the interface
var getSequelize = require('../sequelizeconn')

function getModels(config) {
  var db        = {};

  /*
  //we don't use this
  if (config.use_env_variable) {
    var sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else {
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
  }
  */
  
  //instead we use this
  var sequelize = getSequelize(config)
  
  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
      var model = sequelize['import'](path.join(__dirname, file));
      db[model.name] = model;
    });
  
  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
  
  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  
  return db;

}

module.exports = getModels


