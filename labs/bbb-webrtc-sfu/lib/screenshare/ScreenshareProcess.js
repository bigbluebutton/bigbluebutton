const ScreenshareManager = require('./ScreenshareManager');

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

process.on('disconnect',function() {
  console.log("Parent exited!");
  process.kill();
});

c = new ScreenshareManager();
