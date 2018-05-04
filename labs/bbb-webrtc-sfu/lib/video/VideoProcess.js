'use strict';

const VideoManager= require('./VideoManager');
const BaseProcess = require('../base/BaseProcess');
const C = require('../bbb/messages/Constants');

const manager = new VideoManager(C.TO_VIDEO, [C.TO_AKKA_APPS], C.VIDEO_MANAGER_PREFIX);
const newProcess = new BaseProcess(manager, C.VIDEO_PROCESS_PREFIX);

newProcess.start();
