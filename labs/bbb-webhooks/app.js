// This is a simple wrapper to run the app with 'node app.js'

require("coffee-script/register");

Application = require('./application.coffee');
application = new Application();
application.start();
