/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  return sequelizeInstance.define('commonnametx', {
    commonNameTxID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'CommonNameTxID'
    },
    timestampCreated: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'TimestampCreated'
    },
    timestampModified: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'TimestampModified'
    },
    version: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Version'
    },
    author: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Author'
    },
    country: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: 'Country'
    },
    language: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: 'Language'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Name'
    },
    variant: {
      type: DataTypes.STRING(2),
      allowNull: true,
      field: 'Variant'
    },
    modifiedByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    },
    createdByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatedByAgentID'
    },
    taxonID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'taxon',
        key: 'taxonID'
      },
      field: 'TaxonID'
    }
  }, {
    tableName: 'commonnametx'
  });
};
