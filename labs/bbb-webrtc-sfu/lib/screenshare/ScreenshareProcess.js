const ScreenshareManager = require('./ScreenshareManager');

let c = new ScreenshareManager();
c.start();

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

process.on('disconnect', c.stopAll);
