"use strict";

const http = require("http");
const fs = require("fs");

module.exports = class HttpServer {

  constructor() {
    //const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
    //const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
    //const credentials = {key: privateKey, cert: certificate};

    this.port = 3008;

    this.server = http.createServer((req,res) => {
      //
    });
  }

  getServerObject() {
    return this.server;
  }

  listen(callback) {
    console.log(' [HttpServer] Listening in port ' + this.port);
    this.server.listen(this.port, callback);
  }

}
