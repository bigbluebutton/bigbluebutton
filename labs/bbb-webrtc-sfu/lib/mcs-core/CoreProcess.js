const MCSApiStub = require('./media/MCSApiStub');

process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

process.on('disconnect',function() {
  console.log("Parent exited!");
  process.kill();
});

core = new MCSApiStub();
