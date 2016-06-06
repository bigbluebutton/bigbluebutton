
(function(window, undefined) {

    var BBBLog = {};

    BBBLog.critical = function (message, data) {
      console.log(message, JSON.stringify(data));
    }
    
    BBBLog.error = function (message, data) {
      console.log(message, JSON.stringify(data));
    }

    BBBLog.warning = function (message, data) {
      console.log(message, JSON.stringify(data));
    }
    
    BBBLog.info = function (message, data) {
      console.log(message, JSON.stringify(data));
    }
    
    BBBLog.debug = function (message, data) {
      console.log(message, JSON.stringify(data));
    }
    
    window.BBBLog = BBBLog;
})(this);

