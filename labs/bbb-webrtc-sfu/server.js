/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

const ConnectionManager = require('./lib/connection-manager/ConnectionManager');
const HttpServer = require('./lib/connection-manager/HttpServer');
const server = new HttpServer();
const WebsocketConnectionManager = require('./lib/connection-manager/WebsocketConnectionManager');
const Logger = require('./lib/utils/Logger');
const ProcessManager = require('./lib/ProcessManager.js');
const PM = new ProcessManager();

PM.start();

const CM = new ConnectionManager(PM.screenshareProcess, PM.videoProcess);

let websocketManager = new WebsocketConnectionManager(server.getServerObject(), '/bbb-webrtc-sfu');

CM.setHttpServer(server);
CM.addAdapter(websocketManager);

CM.listen(() => {
  Logger.info("[MainProcess] Server started");
});
