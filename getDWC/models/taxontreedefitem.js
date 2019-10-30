/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  var TaxonTreeDefItem = sequelizeInstance.define('TaxonTreeDefItem', {
    TaxonTreeDefItemID: {
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
    Version: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    FormatToken: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    FullNameSeparator: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    IsEnforced: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    IsInFullName: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    Name: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    RankID: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    Remarks: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    TextAfter: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    TextBefore: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    Title: {
      type: DataTypes.STRING(64),
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
    },
    TaxonTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'taxontreedef',
        key: 'TaxonTreeDefID'
      }
    },
    ParentItemID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxontreedefitem',
        key: 'TaxonTreeDefItemID'
      }
    }
  }, {
    tableName: 'taxontreedefitem'
  });

  return TaxonTreeDefItem
};
