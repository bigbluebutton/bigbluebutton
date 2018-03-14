'use strict';

const VideoManager= require('./VideoManager');
const BaseProcess = require('../base/BaseProcess');

const manager = new VideoManager();
const newProcess = new BaseProcess(manager, '[VideoManager]');

newProcess.start();
