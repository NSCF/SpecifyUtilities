/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  var Agent = sequelizeInstance.define('Agent', {
    agentID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'AgentID'
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
    abbreviation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Abbreviation'
    },
    agentType: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      field: 'AgentType'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'DateOfBirth'
    },
    dateOfBirthPrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'DateOfBirthPrecision'
    },
    dateOfDeath: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'DateOfDeath'
    },
    dateOfDeathPrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'DateOfDeathPrecision'
    },
    dateType: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'DateType'
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Email'
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'FirstName'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    initials: {
      type: DataTypes.STRING(8),
      allowNull: true,
      field: 'Initials'
    },
    interests: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Interests'
    },
    jobTitle: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'JobTitle'
    },
    lastName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'LastName'
    },
    middleInitial: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'MiddleInitial'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    suffix: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Suffix'
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Title'
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: true,
      field: 'URL'
    },
    divisionId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'division',
        key: 'UserGroupScopeId'
      },
      field: 'DivisionID'
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
    parentOrganizationId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ParentOrganizationID'
    },
    institutionTcid: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'institution',
        key: 'UserGroupScopeId'
      },
      field: 'InstitutionTCID'
    },
    collectionTcid: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collection',
        key: 'UserGroupScopeId'
      },
      field: 'CollectionTCID'
    },
    institutionCcid: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'institution',
        key: 'UserGroupScopeId'
      },
      field: 'InstitutionCCID'
    },
    specifyUserID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      },
      field: 'SpecifyUserID'
    },
    collectionCcid: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collection',
        key: 'UserGroupScopeId'
      },
      field: 'CollectionCCID'
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
    tableName: 'agent'
  });

  Agent.associate = function(models){
    models.Agent.belongsToMany(models.CollectingEvent, {as: 'collectingEvents', through:'collector', foreignKey:'AgentID'})
  }

  return Agent

};
