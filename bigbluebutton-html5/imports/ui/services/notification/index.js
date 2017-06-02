import { check } from 'meteor/check';

const collection = new Mongo.Collection(null);

function findById(notificationId) {
  check(notificationId, String);
  collection.find({ notificationId });
}

function add(notification) {
  check(notification.notification, String);
  collection.insert(notification);
}

function remove(notificationId) {
  check(notificationId, String);
  collection.remove({ notificationId });
}

const NotificationCollection = { findById, add, remove };

export default NotificationCollection;

export {
    findById,
    add,
    remove,
};
