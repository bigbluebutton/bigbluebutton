// This is a simple wrapper to run the app with 'node app.js'

require("coffee-script");

// Start the server
app = require('./app.coffee');
app.listen(3000, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
