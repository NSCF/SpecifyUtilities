/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Division = sequelize.define('Division', {
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
    abbrev: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Abbrev'
    },
    altName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'AltName'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Description'
    },
    disciplineType: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'DisciplineType'
    },
    divisionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'divisionId'
    },
    iconUri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'IconURI'
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
    uri: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Uri'
    },
    addressId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'address',
        key: 'AddressID'
      },
      field: 'AddressID'
    },
    institutionId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'institution',
        key: 'UserGroupScopeId'
      },
      field: 'InstitutionID'
    }
  }, {
    tableName: 'division'
  });

  Division.associate = function(models){
    models.Division.belongsTo(models.Institution, {as: 'institution', foreignKey: 'institutionId'})
  }

  return Division
};
