/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  return sequelizeInstance.define('specifyuser', {
    SpecifyUserID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    TimestampCreated: {
      type: DataTypes.DATE,
      allowNull: false
    },
    TimestampModified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Version: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    AccumMinLoggedIn: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    EMail: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    IsLoggedIn: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    IsLoggedInReport: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    LoginCollectionName: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    LoginDisciplineName: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    LoginOutTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    UserType: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    ModifiedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    },
    CreatedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    }
  }, {
    tableName: 'specifyuser'
  });
};
