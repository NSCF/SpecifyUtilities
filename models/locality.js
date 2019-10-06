/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Locality = sequelize.define('Locality', {
    localityId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'LocalityID'
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
    datum: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Datum'
    },
    elevationAccuracy: {
      type: "DOUBLE",
      allowNull: true,
      field: 'ElevationAccuracy'
    },
    elevationMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'ElevationMethod'
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
    lat1Text: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Lat1Text'
    },
    lat2Text: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Lat2Text'
    },
    latLongAccuracy: {
      type: "DOUBLE",
      allowNull: true,
      field: 'LatLongAccuracy'
    },
    latLongMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'LatLongMethod'
    },
    latLongType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'LatLongType'
    },
    latitude1: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'Latitude1'
    },
    latitude2: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'Latitude2'
    },
    localityName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'LocalityName'
    },
    long1Text: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Long1Text'
    },
    long2Text: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'Long2Text'
    },
    longitude1: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'Longitude1'
    },
    longitude2: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      field: 'Longitude2'
    },
    maxElevation: {
      type: "DOUBLE",
      allowNull: true,
      field: 'MaxElevation'
    },
    minElevation: {
      type: "DOUBLE",
      allowNull: true,
      field: 'MinElevation'
    },
    namedPlace: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'NamedPlace'
    },
    originalElevationUnit: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'OriginalElevationUnit'
    },
    originalLatLongUnit: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'OriginalLatLongUnit'
    },
    relationToNamedPlace: {
      type: DataTypes.STRING(120),
      allowNull: true,
      field: 'RelationToNamedPlace'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    sgrStatus: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'SGRStatus'
    },
    shortName: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'ShortName'
    },
    srcLatLongUnit: {
      type: DataTypes.INTEGER(4),
      allowNull: false,
      field: 'SrcLatLongUnit'
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
    verbatimElevation: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'VerbatimElevation'
    },
    verbatimLatitude: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'VerbatimLatitude'
    },
    verbatimLongitude: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'VerbatimLongitude'
    },
    visibility: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'Visibility'
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
    geographyId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'geography',
        key: 'GeographyID'
      },
      field: 'GeographyID'
    },
    visibilitySetById: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      },
      field: 'VisibilitySetByID'
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
    disciplineId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'discipline',
        key: 'UserGroupScopeId'
      },
      field: 'DisciplineID'
    },
    paleoContextId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'paleocontext',
        key: 'PaleoContextID'
      },
      field: 'PaleoContextID'
    }
  }, {
    tableName: 'locality'
  });

  Locality.associate = function(models) {
    models.Locality.hasMany(models.GeoCoordDetail, {as: 'georefDetails', foreignKey: 'localityId'})
  }

  return Locality
};
