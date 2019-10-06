/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Collection = sequelize.define('Collection', {
    userGroupScopeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      field: 'UserGroupScopeId'
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
    createdByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatedByAgentID'
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
    catalogFormatNumName: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'CatalogFormatNumName'
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Code'
    },
    collectionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'collectionId'
    },
    collectionName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'CollectionName'
    },
    collectionType: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'CollectionType'
    },
    dbContentVersion: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'DbContentVersion'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Description'
    },
    developmentStatus: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'DevelopmentStatus'
    },
    estimatedSize: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'EstimatedSize'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    institutionType: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'InstitutionType'
    },
    isEmbeddedCollectingEvent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsEmbeddedCollectingEvent'
    },
    isaNumber: {
      type: DataTypes.STRING(24),
      allowNull: true,
      field: 'IsaNumber'
    },
    kingdomCoverage: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'KingdomCoverage'
    },
    preservationMethodType: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'PreservationMethodType'
    },
    primaryFocus: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'PrimaryFocus'
    },
    primaryPurpose: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'PrimaryPurpose'
    },
    regNumber: {
      type: DataTypes.STRING(24),
      allowNull: true,
      field: 'RegNumber'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    scope: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Scope'
    },
    webPortalUri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'WebPortalURI'
    },
    webSiteUri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'WebSiteURI'
    },
    institutionNetworkId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'institution',
        key: 'UserGroupScopeId'
      },
      field: 'InstitutionNetworkID'
    },
    adminContactId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'AdminContactID'
    },
    disciplineId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'discipline',
        key: 'UserGroupScopeId'
      },
      field: 'DisciplineID'
    }
  }, {
    tableName: 'collection'
  });

  Collection.associate = function(models){
    models.Collection.belongsTo(models.Discipline, {as: 'discipline', foreignKey: 'disciplineId'})
  }
  return Collection
};
