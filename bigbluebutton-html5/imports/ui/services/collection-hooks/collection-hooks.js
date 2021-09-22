import CollectionEventsBroker from '/imports/ui/services/collection-hooks-callbacks/collection-hooks-callbacks';

Meteor.connection._processOneDataMessage = function (msg, updates) {
  const messageType = msg.msg;

  let col = null;
  if (msg.collection && msg.collection.indexOf('stream-cursor') === -1) {
    col = Meteor.connection._stores[msg.collection]?._getCollection();
  }
  CollectionEventsBroker.dispatchEvent(msg, updates);
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
};
