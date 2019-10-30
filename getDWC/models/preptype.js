/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var PrepType = sequelize.define('PrepType', {
    prepTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'PrepTypeID'
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
    isLoanable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsLoanable'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'Name'
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
    collectionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'collection',
        key: 'UserGroupScopeId'
      },
      field: 'CollectionID'
    },
    modifiedByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    }
  }, {
    tableName: 'preptype'
  });

  return PrepType
};
