import db from '/imports/ui/services/notification/index.js';

class NotificationService {

    /**
     * Database to be transacted
     * @param {Object} database
     */
  constructor(database) {
    this.database = database;
  }

    /**
     * @param {string} notificationID
     */
  get(notificationID) {
    this.database.findById(notificationID);
  }

    /**
     * @param {Object} notification
     */
  add(notification) {
    this.database.add(notification);
  }

    /**
     * @param {string} notificationID
     */
  remove(notificationID) {
    this.database.remove(notificationID);
  }
}

const NotificationServiceSingleton = new NotificationService(db);

export {
    NotificationService,
};

export default NotificationServiceSingleton;
