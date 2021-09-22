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
        throw new Error('There is already an associated callback for this event');
      }
      this.callbacks[index] = callback;
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  dispatchEvent(msg, updates) {
    const msgIndex = CollectionEventsBroker.getKey(msg, updates);
    const { fields } = msg;
    const callback = this.callbacks[msgIndex];
    if (callback) {
      callback(fields);
    }
    // TODO: also process the updates object
  }
}

export default new CollectionEventsBroker();
