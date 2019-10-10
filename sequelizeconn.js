const Sequelize = require('sequelize');

module.exports = function(config){
    return new Sequelize(config.database, config.user, config.pwd, {
        dialect: 'mysql',
        operatorsAliases: false,

        host: config.host,
        user: config.user,
        password: config.pwd,
        database: config.database,

        logging: false,

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

        define: {
            timestamps: true,
            createdAt: 'timestampCreated',
            updatedAt: 'timestampModified'
        },
        
        timezone: '+02:00'
        
    });
    
}