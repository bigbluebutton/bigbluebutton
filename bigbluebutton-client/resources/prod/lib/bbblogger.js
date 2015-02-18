
(function(window, undefined) {

    var BBBLog = {};

    /**
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     *
     *   DO NOT CALL THIS METHOD FROM YOUR JS CODE.
     *
     * This is called by the BigBlueButton Flash client.
     *
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
     * NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE! NOTE!
     * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=     
     */
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

