const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  created_at: { type: Date, default: Date.now },
  broadcast_at: { type: Date, default: Date.now },
  owner: {
    type: String,
    required: true,
  },
  kind: {
    type: String,
    required: true,
  },
  data: {},
});

notificationSchema.statics.insertNotifications = function insertNotifications(notifications, cb) {
  const documents = notifications.map(notification => ({
    owner: notification.toUser,
    kind: notification.type,
    broadcast_at: notification.timestamp,
    data: notification.data,
  }));
  return this.insertMany(documents, cb);
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
