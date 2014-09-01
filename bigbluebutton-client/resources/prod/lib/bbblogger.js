
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
    BBBLog.log = function (text) {
      console.log("LOG - " + text);
    }

    window.BBBLog = BBBLog;
})(this);

