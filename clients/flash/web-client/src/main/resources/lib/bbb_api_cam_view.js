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
    CAM_VIEW.viewWebcamStream = function(url, streamName, avatarURL) {
      console.log("CAM_VIEW::viewWebcamStream [" + url + "," + streamName + "]");
      
      var swfObj = getSwfObj();
      if (swfObj) {
          console.log("CAM_VIEW::viewWebcamStream 2 [" + url + "," + streamName + "]");
          swfObj.startViewCameraStream(url, streamName, avatarURL);    
      }
    }

    /**
     * Stop viewing user's webcam.
     */ 
    CAM_VIEW.stopViewWebcamStream = function(avatarURL) {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.stopViewCameraStream(avatarURL);    
      }
    }
    
    console.log("CAM_VIEW INITIALIZED");    
    window.CAM_VIEW = CAM_VIEW;
})(this);

