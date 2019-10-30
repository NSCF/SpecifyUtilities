/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  var PreparationAttachment = sequelize.define('PreparationAttachment', {
    preparationAttachmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'PreparationAttachmentID'
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
    ordinal: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      field: 'Ordinal'
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'Remarks'
    },
    attachmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'attachment',
        key: 'AttachmentID'
      },
      field: 'AttachmentID'
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
    preparationId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'preparation',
        key: 'PreparationID'
      },
      field: 'PreparationID'
    },
    modifiedByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'ModifiedByAgentID'
    }
  }, {
    tableName: 'preparationattachment'
  });

  PreparationAttachment.associate = function(models){
    models.PreparationAttachment.belongsTo(models.Attachment, { as: 'file', foreignKey: 'attachmentId' })
  }

  return PreparationAttachment
};
