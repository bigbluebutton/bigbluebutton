/*
This class allows other parts of the code to get called when an event (insert/update/delete) occurs in a server-side published cursor.

In implementation time it was created for the publisher ( meteor live data hooks ) notify the listener ( LocalCollectionSynchronizer ) about the events.

*/
class CollectionEventsBroker {
  static getKey(msg, updates) {
    // the msg.msg has the collection event,
    // see the collection hooks event object for more information
    return `/${msg.collection}/${msg.msg}/`;
    // TODO: also process the updates object
  }

  constructor() {
    this.callbacks = {};
  }

  addListener(collection, event, callback) {
    try {
      const index = CollectionEventsBroker.getKey({ collection, msg: event });
      const TheresCallback = this.callbacks[index];
      if (TheresCallback) {
        console.log('There is already an associated callback for this event');
        return true;
      }
      this.callbacks[index] = callback;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  dispatchEvent(msg, updates) {
    try {
      const msgIndex = CollectionEventsBroker.getKey(msg, updates);
      const { fields } = msg;
      const callback = this.callbacks[msgIndex];
      if (callback) {
        callback({ ...fields, referenceId: msg.id });
      }
    } catch (error) {
      console.error('Error:', error);
    }
    // TODO: also process the updates object
  }
}

const collectionEventsBroker = new CollectionEventsBroker();

export const liveDataEventBrokerInitializer = () => {
  Meteor.connection._processOneDataMessage = function (msg, updates) {
    try {
      const messageType = msg.msg;
      let col = null;
      if (msg.collection && msg.collection.indexOf('stream-cursor') === -1) {
        col = Meteor.connection._stores[msg.collection]?._getCollection();
      }
      collectionEventsBroker.dispatchEvent(msg, updates);
      // msg is one of ['added', 'changed', 'removed', 'ready', 'updated']
      if (messageType === 'added') {
        if (!col || !col.onAdded || col.onAdded(msg, updates)) {
          this._process_added(msg, updates);
        }
      } else if (messageType === 'changed') {
        if (!col || !col.onChanged || col.onChanged(msg, updates)) {
          this._process_changed(msg, updates);
        }
      } else if (messageType === 'removed') {
        if (!col || !col.onRemoved || col.onRemoved(msg, updates)) {
          this._process_removed(msg, updates);
        }
      } else if (messageType === 'ready') {
        if (!col || !col.onReady || col.onReady(msg, updates)) {
          this._process_ready(msg, updates);
        }
      } else if (messageType === 'updated') {
        if (!col || !col.onUpdated || col.onUpdated(msg, updates)) {
          this._process_updated(msg, updates);
        }
      } else if (messageType === 'nosub') {
        // ignore this
      } else {
        Meteor._debug('discarding unknown livedata data message type', msg);
      }
    } catch (err) {
      console.error('Error when calling hooks', err);
    }
  };
};

export default collectionEventsBroker;
