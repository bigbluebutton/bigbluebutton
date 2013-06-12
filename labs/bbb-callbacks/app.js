var querystring = require('querystring'),
    http = require('http'),
    url = require('url'),
    redis = require("redis"),
    subscriber = redis.createClient(),
    client = redis.createClient();

subscriber.on("subscribe", function (channel, count) {
  console.log("subscribed to " + channel);
});

subscriber.on("message", function (channel, message) {
  console.log(message);
  properties = JSON.parse(message);

  console.log(properties.event)
  console.log(properties.meetingID)
  client.lrange("meeting:" + properties.meetingID + ":subscriptions:" + properties.event, 0, -1, function(error,reply){
    
    reply.forEach(function (sid, index) {
      console.log(sid);
      client.hgetall("meeting:" + properties.meetingID + ":subscription:" + sid, function(err,rep){
        console.log(rep); 
        var post_data = querystring.stringify(properties);
        var url_parts = url.parse(rep.callbackURL, true);
        
        var post_options = {
          host: url_parts.hostname,
          port: (url_parts.port == undefined) ? '80' : url_parts.port,
          path: url_parts.path,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length
          }
        };

        console.log(post_options);
        var post_req = http.request(post_options, function(res) {
          res.setEncoding('utf8');
          res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
          });
        });

        post_req.on('error',function(badreq){
          console.log(badreq);
        });

        // write parameters to post body
        post_req.write(post_data);
        post_req.end();
      });
    });
    
  });

});

subscriber.subscribe("bigbluebutton:events");