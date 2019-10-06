/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('paleocontext', {
    paleoContextId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'PaleoContextID'
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
    number1: {
      type: "DOUBLE",
      allowNull: true,
      field: 'Number1'
    },
    number2: {
      type: "DOUBLE",
      allowNull: true,
      field: 'Number2'
    },
    number3: {
      type: "DOUBLE",
      allowNull: true,
      field: 'Number3'
    },
    number4: {
      type: "DOUBLE",
      allowNull: true,
      field: 'Number4'
    },
    number5: {
      type: "DOUBLE",
      allowNull: true,
      field: 'Number5'
    },
    paleoContextName: {
      type: DataTypes.STRING(80),
      allowNull: true,
      field: 'PaleoContextName'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    text1: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Text1'
    },
    text2: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Text2'
    },
    text3: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'Text3'
    },
    text4: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'Text4'
    },
    text5: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'Text5'
    },
    yesNo1: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo1'
    },
    yesNo2: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo2'
    },
    yesNo3: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo3'
    },
    yesNo4: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo4'
    },
    yesNo5: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo5'
    },
    bioStratId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geologictimeperiod',
        key: 'GeologicTimePeriodID'
      },
      field: 'BioStratID'
    },
    chronosStratEndId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geologictimeperiod',
        key: 'GeologicTimePeriodID'
      },
      field: 'ChronosStratEndID'
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
    lithoStratId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lithostrat',
        key: 'LithoStratID'
      },
      field: 'LithoStratID'
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
    chronosStratId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geologictimeperiod',
        key: 'GeologicTimePeriodID'
      },
      field: 'ChronosStratID'
    }
  }, {
    tableName: 'paleocontext'
  });
};
