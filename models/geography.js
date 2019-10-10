/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Geography =  sequelize.define('Geography', {
    geographyId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'GeographyID'
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
    abbrev: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'Abbrev'
    },
    centroidLat: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'CentroidLat'
    },
    centroidLon: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'CentroidLon'
    },
    commonName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'CommonName'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'FullName'
    },
    geographyCode: {
      type: DataTypes.STRING(24),
      allowNull: true,
      field: 'GeographyCode'
    },
    gml: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'GML'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    highestChildNodeNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'HighestChildNodeNumber'
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsAccepted'
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'IsCurrent'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'Name'
    },
    nodeNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'NodeNumber'
    },
    number1: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Number1'
    },
    number2: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Number2'
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
    text1: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'Text1'
    },
    text2: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'Text2'
    },
    timestampVersion: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'TimestampVersion'
    },
    parentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geography',
        key: 'GeographyID'
      },
      field: 'ParentID'
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
    modifiedByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    },
    geographyTreeDefItemId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'geographytreedefitem',
        key: 'GeographyTreeDefItemID'
      },
      field: 'GeographyTreeDefItemID'
    },
    acceptedId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geography',
        key: 'GeographyID'
      },
      field: 'AcceptedID'
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
    tableName: 'geography'
  });

  Geography.associate = function(models){
    models.Geography.belongsTo(models.GeographyTreeDefItem, {as: 'level', foreignKey: 'geographyTreeDefItemId'})
  }

  return Geography
};
