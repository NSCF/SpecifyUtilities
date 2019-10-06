/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Determination =  sequelize.define('Determination', {
    determinationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'DeterminationID'
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
    addendum: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'Addendum'
    },
    alternateName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'AlternateName'
    },
    confidence: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Confidence'
    },
    determinedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'DeterminedDate'
    },
    determinedDatePrecision: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'DeterminedDatePrecision'
    },
    featureOrBasis: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'FeatureOrBasis'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsCurrent'
    },
    method: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Method'
    },
    nameUsage: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'NameUsage'
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
    qualifier: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'Qualifier'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    subSpQualifier: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'SubSpQualifier'
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
    typeStatusName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'TypeStatusName'
    },
    varQualifier: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'VarQualifier'
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
    determinerId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'DeterminerID'
    },
    taxonId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'TaxonID'
    },
    preferredTaxonId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'PreferredTaxonID'
    },
    collectionObjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'collectionobject',
        key: 'CollectionObjectID'
      },
      field: 'CollectionObjectID'
    }
  }, {
    tableName: 'determination'
  });

  Determination.associate = function(models){
    models.Determination.belongsTo(models.Taxon, {as: 'dettaxon', foreignKey: 'taxonId'})
  }

  return Determination
};
