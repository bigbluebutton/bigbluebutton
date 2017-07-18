/*
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

const ConnectionManager = require('./lib/ConnectionManager');
const CM = new ConnectionManager(); 

process.on('SIGTERM', CM._stopAll.bind(CM));
process.on('SIGINT', CM._stopAll.bind(CM));
