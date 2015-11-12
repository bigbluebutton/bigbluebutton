// Lists all the events that happen in a meeting. Run with 'node events.js'.
// Uses the first meeting started after the application runs and will list all
// events, but only the first time they happen.

redis = require("redis");

var target_meeting = null;
var events_printed = [];
var subscriber = redis.createClient();

subscriber.on("psubscribe", function(channel, count) {
  console.log("subscribed to " + channel);
});

subscriber.on("pmessage", function(pattern, channel, message) {
  try {
    message = JSON.parse(message);
    if (message !== null && message !== undefined && message.header !== undefined) {

      var message_meeting_id = message.payload.meeting_id;
      var message_name = message.header.name;

      if (message_name === "meeting_created_message") {
        if (target_meeting === null) {
          target_meeting = message_meeting_id;
        }
      }

      if (target_meeting !== null && target_meeting === message_meeting_id) {
        if (!containsOrAdd(events_printed, message_name)) {
          console.log("\n###", message_name, "\n");
          console.log(message);
          console.log("\n");
        }
      }

    }
  } catch(e) {
    console.log("error processing the message", message, ":", e);
  }
});

subscriber.psubscribe("bigbluebutton:*");

var containsOrAdd = function(list, value) {
  for (i = 0; i <= list.length-1; i++) {
    if (list[i] === value) {
      return true;
    }
  }
  list.push(value);
  return false;
}
