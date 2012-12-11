(function(window, undefined) {

    var CAM_VIEW = {};

    /**
     * Internal function to get the BBB embed object. Seems like we have to do this
     * each time and can't create a var for it.
     *
     * To get the object, see https://code.google.com/p/swfobject/wiki/api
     */
    function getSwfObj() {
      return swfobject.getObjectById("WebcamViewStandalone");
    }

   
    /**
     * View user's webcam.
     */    
    CAM_VIEW.viewCamera = function(url, streamName) {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.viewCamera(url, streamName);    
      }
    }

    /**
     * Stop viewing user's webcam.
     */ 
    CAM_VIEW.stopViewCamera = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.stopViewCamera();    
      }
    }
        
    window.CAM_VIEW = CAM_VIEW;
})(this);

