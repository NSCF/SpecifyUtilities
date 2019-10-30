/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var GeographyTreeDefItem = sequelize.define('GeographyTreeDefItem', {
    geographyTreeDefItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'GeographyTreeDefItemID'
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
    fullNameSeparator: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'FullNameSeparator'
    },
    isEnforced: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IsEnforced'
    },
    isInFullName: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IsInFullName'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'Name'
    },
    rankId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'RankID'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    textAfter: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'TextAfter'
    },
    textBefore: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'TextBefore'
    },
    title: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Title'
    },
    geographyTreeDefId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'geographytreedef',
        key: 'GeographyTreeDefID'
      },
      field: 'GeographyTreeDefID'
    },
    parentItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geographytreedefitem',
        key: 'GeographyTreeDefItemID'
      },
      field: 'ParentItemID'
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
    tableName: 'geographytreedefitem'
  });

  return GeographyTreeDefItem
};
