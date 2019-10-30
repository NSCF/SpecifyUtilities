/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Institution = sequelize.define('Institution', {
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
    altName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'AltName'
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Code'
    },
    copyright: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Copyright'
    },
    currentManagedRelVersion: {
      type: DataTypes.STRING(8),
      allowNull: true,
      field: 'CurrentManagedRelVersion'
    },
    currentManagedSchemaVersion: {
      type: DataTypes.STRING(8),
      allowNull: true,
      field: 'CurrentManagedSchemaVersion'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Description'
    },
    disclaimer: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Disclaimer'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    hasBeenAsked: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'HasBeenAsked'
    },
    iconUri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'IconURI'
    },
    institutionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'institutionId'
    },
    ipr: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Ipr'
    },
    isAccessionsGlobal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsAccessionsGlobal'
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IsAnonymous'
    },
    isReleaseManagedGlobally: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IsReleaseManagedGlobally'
    },
    isSecurityOn: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsSecurityOn'
    },
    isServerBased: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsServerBased'
    },
    isSharingLocalities: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsSharingLocalities'
    },
    isSingleGeographyTree: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsSingleGeographyTree'
    },
    license: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'License'
    },
    lsidAuthority: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'LsidAuthority'
    },
    minimumPwdLength: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'MinimumPwdLength'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Name'
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
    termsOfUse: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'TermsOfUse'
    },
    uri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Uri'
    },
    storageTreeDefId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'storagetreedef',
        key: 'StorageTreeDefID'
      },
      field: 'StorageTreeDefID'
    },
    addressId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'address',
        key: 'AddressID'
      },
      field: 'AddressID'
    }
  }, {
    tableName: 'institution'
  });
  
  return Institution
};
