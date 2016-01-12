const bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; }, indexOf = [].indexOf || function(item) { for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Meteor.methods({
  validateAuthToken(meetingId, userId, authToken) {
    let message;
    Meteor.log.info("sending a validate_auth_token with", {
      userid: userId,
      authToken: authToken,
      meetingid: meetingId
    });
    message = {
      "payload": {
        "auth_token": authToken,
        "userid": userId,
        "meeting_id": meetingId
      },
      "header": {
        "timestamp": new Date().getTime(),
        "reply_to": `${meetingId}/${userId}`,
        "name": "validate_auth_token"
      }
    };
    if((authToken != null) && (userId != null) && (meetingId != null)) {
      createDummyUser(meetingId, userId, authToken);
      return publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
    } else {
      return Meteor.log.info("did not have enough information to send a validate_auth_token message");
    }
  }
});

Meteor.RedisPubSub = (function() {
  class RedisPubSub {
    constructor(callback) {
      this._addToQueue = bind(this._addToQueue, this);
      this._onSubscribe = bind(this._onSubscribe, this);
      Meteor.log.info("constructor RedisPubSub");
      this.pubClient = redis.createClient();
      this.subClient = redis.createClient();
      Meteor.log.info(`Subscribing message on channel: ${Meteor.config.redis.channels.fromBBBApps}`);
      this.subClient.on("psubscribe", Meteor.bindEnvironment(this._onSubscribe));
      this.subClient.on("pmessage", Meteor.bindEnvironment(this._addToQueue));
      this.subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps);
      callback(this);
    }

    _onSubscribe(channel, count) {
      let message;
      Meteor.log.info(`Subscribed to ${channel}`);
      message = {
        "header": {
          "name": "get_all_meetings_request"
        },
        "payload": {}
      };
      return publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
    }

    _addToQueue(pattern, channel, jsonMsg) {
      let eventName, message, messagesWeIgnore;
      message = JSON.parse(jsonMsg);
      eventName = message.header.name;
      messagesWeIgnore = ["BbbPubSubPongMessage", "bbb_apps_is_alive_message", "broadcast_layout_message"];
      if(indexOf.call(messagesWeIgnore, eventName) < 0) {
        console.log(`Q ${eventName} ${Meteor.myQueue.total()}`);
        return Meteor.myQueue.add({
          pattern: pattern,
          channel: channel,
          jsonMsg: jsonMsg
        });
      }
    }
  }

  return RedisPubSub;
})();

this.publish = function(channel, message) {
  Meteor.log.info(`redis outgoing message  ${message.header.name}`, {
    channel: channel,
    message: message
  });
  if(Meteor.redisPubSub != null) {
    return Meteor.redisPubSub.pubClient.publish(channel, JSON.stringify(message), (err, res) => {
      if(err) {
        return Meteor.log.info("error", {
          error: err
        });
      }
    });
  } else {
    return Meteor.log.info("ERROR!! Meteor.redisPubSub was undefined");
  }
};
