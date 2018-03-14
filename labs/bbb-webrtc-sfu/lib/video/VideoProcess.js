'use strict';

const VideoManager= require('./VideoManager');
const BaseProcess = require('../base/BaseProcess');

let manager = new VideoManager();
let newProcess = new BaseProcess(manager, '[VideoManager]');

newProcess.start();
