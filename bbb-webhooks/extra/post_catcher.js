// Lists all the events that happen in a meeting. Run with 'node events.js'.
// Uses the first meeting started after the application runs and will list all
// events, but only the first time they happen.

var redis = require("redis");
var express = require("express");
var request = require("request");
var sha1 = require("sha1");
var bodyParser = require('body-parser');

// server configs
var port = 3006;                                        // port in which to run this app
var shared_secret = "33e06642a13942004fd83b3ba6e4104a"; // shared secret of your server
var domain = "127.0.0.1";                               // address of your server
var target_domain = "127.0.0.1:3005";                   // address of the webhooks app

var encodeForUrl = function(value) {
  return encodeURIComponent(value)
    .replace(/%20/g, '+')
    .replace(/[!'()]/g, escape)
    .replace(/\*/g, "%2A")
}

// create a server to listen for callbacks
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.listen(port);
app.post("/callback", function(req, res, next) {
  console.log("-------------------------------------");
  console.log("* Received:", req.url);
  console.log("* Body:", req.body);
  console.log("-------------------------------------\n");
  res.statusCode = 200;
  res.send();
});
console.log("Server listening on port", port);

// registers a global hook on the webhooks app
var myurl = "http://" + domain + ":" + port + "/callback";
var params = "callbackURL=" + encodeForUrl(myurl);
var checksum = sha1("hooks/create" + params + shared_secret);
var fullurl = "http://" + target_domain + "/bigbluebutton/api/hooks/create?" +
  params + "&checksum=" + checksum

var requestOptions = {
  uri: fullurl,
  method: "GET"
}
console.log("Registering a hook with", fullurl);
request(requestOptions, function(error, response, body) {
  console.log("Response from hook/create:", body);
});
