/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var CollectingEvent = sequelize.define('CollectingEvent', {
    collectingEventId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'CollectingEventID'
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
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'EndDate'
    },
    endDatePrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'EndDatePrecision'
    },
    endDateVerbatim: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'EndDateVerbatim'
    },
    endTime: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
      field: 'EndTime'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    integer1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Integer1'
    },
    integer2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Integer2'
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Method'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    reservedInteger3: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'ReservedInteger3'
    },
    reservedInteger4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'ReservedInteger4'
    },
    reservedText1: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'ReservedText1'
    },
    reservedText2: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'ReservedText2'
    },
    sgrStatus: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'SGRStatus'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'StartDate'
    },
    startDatePrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'StartDatePrecision'
    },
    startDateVerbatim: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StartDateVerbatim'
    },
    startTime: {
      type: DataTypes.INTEGER(6),
      allowNull: true,
      field: 'StartTime'
    },
    stationFieldNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StationFieldNumber'
    },
    stationFieldNumberModifier1: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StationFieldNumberModifier1'
    },
    stationFieldNumberModifier2: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StationFieldNumberModifier2'
    },
    stationFieldNumberModifier3: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StationFieldNumberModifier3'
    },
    text1: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text1'
    },
    text2: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text2'
    },
    text3: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text3'
    },
    text4: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text4'
    },
    text5: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text5'
    },
    verbatimDate: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'VerbatimDate'
    },
    verbatimLocality: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'VerbatimLocality'
    },
    visibility: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'Visibility'
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
    disciplineId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'discipline',
        key: 'UserGroupScopeId'
      },
      field: 'DisciplineID'
    },
    paleoContextId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'paleocontext',
        key: 'PaleoContextID'
      },
      field: 'PaleoContextID'
    },
    localityId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'locality',
        key: 'LocalityID'
      },
      field: 'LocalityID'
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
    collectingEventAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collectingeventattribute',
        key: 'CollectingEventAttributeID'
      },
      field: 'CollectingEventAttributeID'
    },
    visibilitySetById: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      },
      field: 'VisibilitySetByID'
    },
    collectingTripId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collectingtrip',
        key: 'CollectingTripID'
      },
      field: 'CollectingTripID'
    }
  }, {
    tableName: 'collectingevent'
  });

  CollectingEvent.associate = function(models) {
    models.CollectingEvent.belongsToMany(models.Agent, {as:'collectors', through: 'collector', foreignKey: 'CollectingEventID'})
    models.CollectingEvent.belongsTo(models.Locality, {as: 'locality', foreignKey: 'localityId'})
  }

  return CollectingEvent

};
