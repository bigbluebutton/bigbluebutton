'use strict';

const ScreenshareManager = require('./ScreenshareManager');
const BaseProcess = require('../base/BaseProcess');
const C = require('../bbb/messages/Constants');

const manager = new ScreenshareManager(C.TO_SCREENSHARE, [C.FROM_BBB_TRANSCODE_SYSTEM_CHAN]);
const newProcess = new BaseProcess(manager, '[ScreenshareProcess]');

newProcess.start();
