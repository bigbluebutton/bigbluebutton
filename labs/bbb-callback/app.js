var request = require('request'),
    redis = require("redis"),
    subscriber = redis.createClient(),
    client = redis.createClient();

subscriber.on("subscribe", function (channel, count) {
  console.log("subscribed to " + channel);
});

subscriber.on("message", function (channel, message) {
  var properties;

  try {
    properties = JSON.parse(message);
  } catch (e) {
    // An error has occured, handle it, by e.g. logging it
    console.log(e);
  }

  if (properties != undefined){
    client.lrange("meeting:" + properties.meetingID + ":subscriptions", 0, -1, function(error,reply){
      reply.forEach(function (sid, index) {
        console.log("subscriber id = " + sid);
        client.hgetall("meeting:" + properties.meetingID + ":subscription:" + sid, function(err,rep){
          if (rep.active == "true") {
            properties.meetingID = rep.externalMeetingID;
            var post_options = {
              uri: rep.callbackURL,
              method: 'POST',
              json: properties
            };

            request(post_options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log("Error calling url: [" + post_options.uri + "]")
                console.log("Error: [" + JSON.stringify(error) + "]");
                console.log("Response: [" + JSON.stringify(response) + "]");
              } else {
                console.log("Passed calling url: [" + post_options.uri + "]")
                console.log("Response: [" + JSON.stringify(response) + "]");
              }
            });
          }
        });
      });
    });
  }

});

subscriber.subscribe("bigbluebutton:webhook_events");
