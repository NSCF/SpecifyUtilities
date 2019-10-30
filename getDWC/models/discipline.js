/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  var Discipline = sequelizeInstance.define('Discipline', {
    UserGroupScopeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
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
    CreatedByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
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
    disciplineID: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    IsPaleoContextEmbedded: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    Name: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    PaleoContextChildTable: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    RegNumber: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    Type: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    DataTypeID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'datatype',
        key: 'DataTypeID'
      }
    },
    DivisionID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'division',
        key: 'UserGroupScopeId'
      }
    },
    TaxonTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxontreedef',
        key: 'TaxonTreeDefID'
      }
    },
    GeologicTimePeriodTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'geologictimeperiodtreedef',
        key: 'GeologicTimePeriodTreeDefID'
      }
    },
    LithoStratTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lithostrattreedef',
        key: 'LithoStratTreeDefID'
      }
    },
    GeographyTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'geographytreedef',
        key: 'GeographyTreeDefID'
      }
    }
  }, {
    tableName: 'discipline'
  });

  Discipline.associate = function(models) {
    models.Discipline.belongsTo(models.Division, {as: 'division', foreignKey: 'DivisionID'})
  }

  return Discipline
};
