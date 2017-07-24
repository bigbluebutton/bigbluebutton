/*
 * Simple wrapper around the ws library
 *
 */

var ws = require('ws');

ws.prototype.sendMessage = function(json) {

  return this.send(JSON.stringify(json), function(error) {
    if(error)
      console.log(' [server] Websocket error "' + error + '" on message "' + json.id + '"');
  });

};


module.exports = ws;