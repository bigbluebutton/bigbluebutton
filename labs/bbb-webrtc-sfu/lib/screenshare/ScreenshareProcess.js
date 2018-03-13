'use strict';

const ScreenshareManager = require('./ScreenshareManager');
const BaseProcess = require('../base/BaseProcess');

let manager = new ScreenshareManager();
let newProcess = new BaseProcess(manager, '[ScreenshareProcess]');

newProcess.start();
