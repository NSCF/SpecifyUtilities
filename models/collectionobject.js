/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var CollectionObject = sequelize.define('CollectionObject', {
    collectionObjectID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    timestampCreated: {
      type: DataTypes.DATE,
      allowNull: false
    },
    timestampModified: {
      type: DataTypes.DATE,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    collectionMemberID: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    altCatalogNumber: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    availability: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    catalogNumber: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    catalogedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    catalogedDatePrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    catalogedDateVerbatim: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    countAmt: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    deaccessioned: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    fieldNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    GUID: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    integer1: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    Integer2: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    InventoryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Modifier: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    Notifications: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    Number1: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    Number2: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    ObjectCondition: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    OCR: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ProjectNumber: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    Remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ReservedInteger3: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ReservedInteger4: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    ReservedText: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    ReservedText2: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    ReservedText3: {
      type: DataTypes.STRING(128),
      allowNull: true
    },
    Restrictions: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    SGRStatus: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    Text1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Text2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Text3: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TotalValue: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    Visibility: {
      type: DataTypes.INTEGER(4),
      allowNull: true
    },
    YesNo1: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    YesNo2: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    YesNo3: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    YesNo4: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    YesNo5: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    YesNo6: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    ContainerOwnerID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'container',
        key: 'ContainerID'
      }
    },
    FieldNotebookPageID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'fieldnotebookpage',
        key: 'FieldNotebookPageID'
      }
    },
    VisibilitySetByID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      }
    },
    AppraisalID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'appraisal',
        key: 'AppraisalID'
      }
    },
    InventorizedByID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    },
    CollectionID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'collection',
        key: 'UserGroupScopeId'
      }
    },
    CatalogerID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    },
    ContainerID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'container',
        key: 'ContainerID'
      }
    },
    CollectionObjectAttributeID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collectionobjectattribute',
        key: 'CollectionObjectAttributeID'
      }
    },
    CreatedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    },
    AccessionID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'accession',
        key: 'AccessionID'
      }
    },
    CollectingEventID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'collectingevent',
        key: 'CollectingEventID'
      }
    },
    ModifiedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      }
    },
    PaleoContextID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'paleocontext',
        key: 'PaleoContextID'
      }
    }
  }, {
    tableName: 'collectionobject'
  });

  CollectionObject.associate = function(models) {
    models.CollectionObject.belongsTo(models.CollectingEvent, {as: 'collectingEvent', foreignKey: 'CollectingEventID', targetKey: 'collectingEventId'})
    models.CollectionObject.belongsTo(models.Collection, {as: 'collection', foreignKey: 'CollectionID'})
    models.CollectionObject.hasMany(models.Determination, {as: 'determinations', foreignKey: 'collectionObjectId'})
    models.CollectionObject.hasMany(models.Preparation), {as: 'preparations', foreignKey: 'collectionObjectId'}
  }

  return CollectionObject

};
