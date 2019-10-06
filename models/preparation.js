/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Preparation = sequelize.define('Preparation', {
    preparationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'PreparationID'
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
    collectionMemberId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'CollectionMemberID'
    },
    countAmt: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'CountAmt'
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Description'
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
    number1: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number1'
    },
    number2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number2'
    },
    preparedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'PreparedDate'
    },
    preparedDatePrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'PreparedDatePrecision'
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
    sampleNumber: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'SampleNumber'
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'Status'
    },
    storageLocation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'StorageLocation'
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
    storageId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'storage',
        key: 'StorageID'
      },
      field: 'StorageID'
    },
    collectionObjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'collectionobject',
        key: 'CollectionObjectID'
      },
      field: 'CollectionObjectID'
    },
    prepTypeId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'preptype',
        key: 'PrepTypeID'
      },
      field: 'PrepTypeID'
    },
    preparationAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'preparationattribute',
        key: 'PreparationAttributeID'
      },
      field: 'PreparationAttributeID'
    },
    preparedById: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'PreparedByID'
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
    tableName: 'preparation'
  });

  Preparation.associate = function(models) {
    models.Preparation.belongsTo(models.PrepType, {as: 'type', foreignKey: 'prepTypeId'})
  }

  return Preparation
};
