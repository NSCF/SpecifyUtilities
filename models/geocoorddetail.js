/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var GeoCoordDetail = sequelize.define('GeoCoordDetail', {
    geoCoordDetailId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'GeoCoordDetailID'
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
    errorPolygon: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'ErrorPolygon'
    },
    geoRefAccuracy: {
      type: "DOUBLE",
      allowNull: true,
      field: 'GeoRefAccuracy'
    },
    geoRefAccuracyUnits: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'GeoRefAccuracyUnits'
    },
    geoRefDetDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'GeoRefDetDate'
    },
    geoRefDetRef: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'GeoRefDetRef'
    },
    geoRefRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'GeoRefRemarks'
    },
    geoRefVerificationStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'GeoRefVerificationStatus'
    },
    maxUncertaintyEst: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'MaxUncertaintyEst'
    },
    maxUncertaintyEstUnit: {
      type: DataTypes.STRING(8),
      allowNull: true,
      field: 'MaxUncertaintyEstUnit'
    },
    namedPlaceExtent: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'NamedPlaceExtent'
    },
    noGeoRefBecause: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'NoGeoRefBecause'
    },
    originalCoordSystem: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'OriginalCoordSystem'
    },
    protocol: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Protocol'
    },
    source: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Source'
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
    uncertaintyPolygon: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'UncertaintyPolygon'
    },
    validation: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Validation'
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
    agentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'AgentID'
    },
    geoRefCompiledDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'GeoRefCompiledDate'
    },
    compiledById: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CompiledByID'
    }
  }, {
    tableName: 'geocoorddetail'
  });

  return GeoCoordDetail

};
