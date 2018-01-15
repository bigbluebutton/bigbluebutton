const VideoManager = require('./VideoManager');

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

process.on('disconnect',function() {
  console.log("Parent exited!");
});
