/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

const ConnectionManager = require('./lib/connection-manager/ConnectionManager');
const HttpServer = require('./lib/connection-manager/HttpServer');
const server = new HttpServer();
const WebsocketConnectionManager = require('./lib/connection-manager/WebsocketConnectionManager');
const cp = require('child_process');

let screenshareProc = cp.fork('./lib/screenshare/ScreenshareProcess', {
    // Pass over all of the environment.
    env: process.ENV,
    // Share stdout/stderr, so we can hear the inevitable errors.
    silent: false
});

let videoProc = cp.fork('./lib/video/VideoProcess.js', {
    // Pass over all of the environment.
    env: process.ENV,
    // Share stdout/stderr, so we can hear the inevitable errors.
    silent: false
});

let onMessage = function (message) {
  console.log('event','child message',this.pid,message);
};

let onError = function(e) {
  console.log('event','child error',this.pid,e);
};

let onDisconnect = function(e) {
  console.log(e);
  console.log('event','child disconnect',this.pid,'killing...');
  this.kill();
};

screenshareProc.on('message',onMessage);
screenshareProc.on('error',onError);
screenshareProc.on('disconnect',onDisconnect);

videoProc.on('message',onMessage);
videoProc.on('error',onError);
videoProc.on('disconnect',onDisconnect);

const CM = new ConnectionManager(screenshareProc, videoProc);

let websocketManager = new WebsocketConnectionManager(server.getServerObject(), '/bbb-webrtc-sfu');

process.on('SIGTERM', process.exit)
process.on('SIGINT', process.exit)
process.on('uncaughtException', function (error) {
  console.log(error.stack);
  process.exit('1');
});


CM.setHttpServer(server);
CM.addAdapter(websocketManager);

CM.listen(() => {
  console.log(" [SERVER] Server started");
});
