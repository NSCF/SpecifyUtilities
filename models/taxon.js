/* jshint indent: 2 */

module.exports = function(sequelizeInstance, DataTypes) {
  var Taxon = sequelizeInstance.define('Taxon', {
    //STANDARD SPECIFY FIELDS
    //taxon fields
    taxonID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'TaxonID'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      field: 'Name'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'FullName'
    },
    author: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Author'
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsAccepted'
    },
    isHybrid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsHybrid', 
      defaultValue: false
    },
    commonName: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'CommonName'
    },
    cultivarName: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'CultivarName'
    },
    source: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Source'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    //tree management fields
    parentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'ParentID'
    },
    acceptedID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'AcceptedID'
    },
    version: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: 1,
      field: 'Version'
    },
    nodeNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'NodeNumber'
    },
    groupNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'GroupNumber'
    },
    highestChildNodeNumber: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'HighestChildNodeNumber'
    },
    rankID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'RankID'
    },
    taxonTreeDefID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'taxontreedef',
        key: 'TaxonTreeDefID'
      },
      field: 'TaxonTreeDefID'
    },
    taxonTreeDefItemID: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'taxontreedefitem',
        key: 'TaxonTreeDefItemID'
      },
      field: 'TaxonTreeDefItemID'
    },
    hybridParent2ID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'HybridParent2ID'
    },
    hybridParent1ID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'taxon',
        key: 'TaxonID'
      },
      field: 'HybridParent1ID'
    },
    //auditing fields
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
    createdByAgentID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatedByAgentID'
    },
    visibilitySetByID: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      },
      field: 'VisibilitySetByID'
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
    //conservationStatus
    citesStatus: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'CitesStatus'
    },
    environmentalProtectionStatus: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'EnvironmentalProtectionStatus'
    },
    esaStatus: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'EsaStatus'
    },
    //external taxon authority references
    colStatus: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'COLStatus'
    },
    isisNumber: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'IsisNumber'
    },
    ncbiTaxonNumber: {
      type: DataTypes.STRING(8),
      allowNull: true,
      field: 'NcbiTaxonNumber'
    },
    usfwsCode: {
      type: DataTypes.STRING(16),
      allowNull: true,
      field: 'UsfwsCode'
    },
    taxonomicSerialNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'TaxonomicSerialNumber'
    },
    //Specify related fields
    labelFormat: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'LabelFormat'
    },
    visibility: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'Visibility'
    },
    
    //CUSTOM FIELDS

    //Integer fields
    originalSANBITaxonID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'Integer1'
    },
    iucnAssessmentYear: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'Integer2'
    },
    //STRING(32) FIELDS
    iucnStatusCriteria: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: 'Text1'
    },
    //TEXT FIELDS
    publicationDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text3'
    },
    webReference: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text4'
    },
    nativeStatus: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text5'
    },
    taxonReferences: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text6'
    },
    distribution: {//equivalent to countries in the original db
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text7'
    },
    SADistribution: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text8'
    },
    taxonReferenceSource: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Text9'
    },
    //STRING(128) FIELDS
    iucnStatus: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Text10'
    },
    topsStatus: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Text11'
    },
    originalSANBIReferenceIDs: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Text12'
    },
    //STRING(256) FIELDS
    iucnAssessmentType: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text14'
    },
    nsslURL: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text15'
    },
    taxonomicStatus: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text16'
    },
    tempAcceptedTaxonName: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text17'
    },
    tempAcceptedTaxonAuthor: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text18'
    },
    //boolean fields
    nsslSensitive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo1'
    },
    exotic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
      field: 'YesNo2'
    },
    //AVAILABLE CUSTOM FIELDS TO USE
    /*
    integer3: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'Integer3'
    },
    integer4: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Integer4'
    },
    integer5: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'Integer5'
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
    number3: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number3'
    },
    number4: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number4'
    },
    number5: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'Number5'
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
    yesNo6: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo6'
    },
    yesNo7: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo7'
    },
    yesNo8: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo8'
    },
    yesNo9: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo9'
    },
    yesNo10: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo10'
    },
    yesNo11: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo11'
    },
    yesNo12: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo12'
    },
    yesNo13: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo13'
    },
    yesNo14: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo14'
    },
    yesNo15: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo15'
    },
    yesNo16: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo16'
    },
    yesNo17: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo17'
    },
    yesNo18: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo18'
    },
    yesNo19: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: 'YesNo19'
    },
    text2: {
      type: DataTypes.STRING(32),
      allowNull: true,
      field: ''
    },
    text13: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'Text13'
    },
    text19: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text19'
    },
    text20: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'Text20'
    },
    unitInd1: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitInd1'
    },
    unitInd2: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitInd2'
    },
    unitInd3: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitInd3'
    },
    unitInd4: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitInd4'
    },
    unitName1: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitName1'
    },
    unitName2: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitName2'
    },
    unitName3: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitName3'
    },
    unitName4: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'UnitName4'
    }
    */
  }, {
    tableName: 'taxon'
  });

  Taxon.associate = function(models){
    models.Taxon.belongsTo(models.TaxonTreeDefItem, {as: 'rank', foreignKey: 'taxonTreeDefItemID'})
    models.Taxon.belongsTo(models.Taxon, {as: 'acceptedTaxon', foreignKey: 'acceptedID'})
  }

  return Taxon
};
