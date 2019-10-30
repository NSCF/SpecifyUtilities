/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  return sequelizeInstance.define('taxoncitation', {
    taxonCitationID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'TaxonCitationID'
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
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number1'
    },
    number2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number2'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
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
    modifiedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    },
    taxonID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'TaxonID'
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
    referenceWorkID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'referencework',
        key: 'ReferenceWorkID'
      },
      field: 'ReferenceWorkID'
    }
  }, {
    tableName: 'taxoncitation'
  });
};
