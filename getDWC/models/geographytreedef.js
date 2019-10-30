/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('geographytreedef', {
    geographyTreeDefId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'GeographyTreeDefID'
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
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
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
    }
  }, {
    tableName: 'geographytreedef'
  });
};
