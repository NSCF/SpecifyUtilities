/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  var TaxonTreeDef = sequelizeInstance.define('TaxonTreeDef', {
    taxonTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'TaxonTreeDefID'
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
    fullNameDirection: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'FullNameDirection'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'Name'
    },
    remarks: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Remarks'
    },
    createdByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatedByAgentID'
    },
    modifiedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    }
  }, {
    tableName: 'taxontreedef'
  });

  return TaxonTreeDef
};
