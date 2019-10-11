/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var Attachment = sequelize.define('Attachment', {
    attachmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'AttachmentID'
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
    attachmentLocation: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'AttachmentLocation'
    },
    captureDevice: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'CaptureDevice'
    },
    copyrightDate: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'CopyrightDate'
    },
    copyrightHolder: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'CopyrightHolder'
    },
    credit: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Credit'
    },
    dateImaged: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'DateImaged'
    },
    fileCreatedDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'FileCreatedDate'
    },
    guid: {
      type: DataTypes.STRING(128),
      allowNull: true,
      field: 'GUID'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'IsPublic'
    },
    license: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'License'
    },
    licenseLogoUrl: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'LicenseLogoUrl'
    },
    metadataText: {
      type: DataTypes.STRING(256),
      allowNull: true,
      field: 'MetadataText'
    },
    mimeType: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'MimeType'
    },
    origFilename: {
      type: DataTypes.STRING(20000),
      allowNull: false,
      field: 'OrigFilename'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    scopeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      field: 'ScopeID'
    },
    scopeType: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'ScopeType'
    },
    subjectOrientation: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'SubjectOrientation'
    },
    subtype: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Subtype'
    },
    tableId: {
      type: DataTypes.INTEGER(6),
      allowNull: false,
      field: 'TableID'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'Title'
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: true,
      field: 'Type'
    },
    visibility: {
      type: DataTypes.INTEGER(4),
      allowNull: true,
      field: 'Visibility'
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
    attachmentImageAttributeId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'attachmentimageattribute',
        key: 'AttachmentImageAttributeID'
      },
      field: 'AttachmentImageAttributeID'
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
    creatorId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatorID'
    },
    visibilitySetById: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'specifyuser',
        key: 'SpecifyUserID'
      },
      field: 'VisibilitySetByID'
    }
  }, {
    tableName: 'attachment'
  });

  Attachment.associate = function(models){
    models.Attachment.belongsToMany(models.Preparation, {through: 'preparationattachment', foreignKey: 'attachmentId'})
    models.Attachment.belongsToMany(models.CollectionObject, {through: 'collectionobjectattachment', foreignKey: 'attachmentId'})
  }

  return Attachment
  
};
