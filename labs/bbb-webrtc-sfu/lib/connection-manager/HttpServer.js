"use strict";

const http = require("http");
const fs = require("fs");
const config = require('config');
const Logger = require('../utils/Logger');

module.exports = class HttpServer {

  constructor() {
    //const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    //const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    //const credentials = {key: privateKey, cert: certificate};

    this.port = config.get('clientPort');

    this.server = http.createServer((req,res) => {
      //
    });
  }

  getServerObject() {
    return this.server;
  }

  listen(callback) {
    Logger.info('[HttpServer] Listening in port ' + this.port);
    this.server.listen(this.port, callback);
  }

}
