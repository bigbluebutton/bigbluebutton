/*
 * WIP: the mcs-core lib will be turned into a dependecy sometime in the near
 * future, and it will probably act with a separate process that answers via
 * its own redis channel
 */
const Logger = require('../../utils/Logger');
const MCSApiStub = require('./media/MCSApiStub');

process.on('uncaughtException', function (error) {
  Logger.error("[mcs-core-process] Uncaught exception with error", error.stack);
});

process.on('disconnect',function() {
  Logger.info("[mcs-core-process] Parent process exited!");
  process.kill();
});

core = new MCSApiStub();
