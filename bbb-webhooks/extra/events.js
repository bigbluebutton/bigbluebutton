// Lists all the events that happen in a meeting. Run with 'node events.js'.
// Uses the first meeting started after the application runs and will list all
// events, but only the first time they happen.

const redis = require("redis");
const config = require('config');
var target_meeting = null;
var events_printed = [];
var subscriber = redis.createClient(config.get(redis.port), config.get(redis.host));

subscriber.on("psubscribe", function(channel, count) {
  console.log("subscribed to " + channel);
});

subscriber.on("pmessage", function(pattern, channel, message) {
  try {
    message = JSON.parse(message);
    if (message.hasOwnProperty('envelope')) {

      var message_name = message.envelope.name;

      if (!containsOrAdd(events_printed, message_name)) {
        console.log("\n###", message_name, "\n");
        console.log(message);
        console.log("\n");
      }
    }
  } catch(e) {
    console.log("error processing the message", message, ":", e);
  }
});

for (i = 0; i < config.get(hooks.channels); ++i) {
  const channel = config.get(hooks.channels)[i];
  subscriber.psubscribe(channel);
}

var containsOrAdd = function(list, value) {
  for (i = 0; i <= list.length-1; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  list.push(value);
  return false;
}
