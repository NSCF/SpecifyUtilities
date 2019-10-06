/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('collectionobjectattachment', {
    collectionObjectAttachmentId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'CollectionObjectAttachmentID'
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
    createdByAgentId: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'agent',
        key: 'AgentID'
      },
      field: 'CreatedByAgentID'
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
    collectionObjectId: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'collectionobject',
        key: 'CollectionObjectID'
      },
      field: 'CollectionObjectID'
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
    tableName: 'collectionobjectattachment'
  });
};
