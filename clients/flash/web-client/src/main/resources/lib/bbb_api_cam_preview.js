(function(window, undefined) {

    var CAM_PREVIEW = {};

    /**
     * Internal function to get the BBB embed object. Seems like we have to do this
     * each time and can't create a var for it.
     *
     * To get the object, see https://code.google.com/p/swfobject/wiki/api
     */
    function getSwfObj() {
      return swfobject.getObjectById("WebcamPreviewStandalone");
    }

   
    /**
     * Preview user's webcam.
     */    
    CAM_PREVIEW.previewCamera = function(camIndex, camWidth, camHeight, 
                                          camKeyFrameInterval, camModeFps, 
                                          camQualityBandwidth, camQualityPicture, avatarURL) {
      console.log("CAM_PREVIEW::previewCamera [" + camIndex + "]");
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.startPreviewCamera(camIndex, camWidth, camHeight, camKeyFrameInterval, camModeFps, 
                               camQualityBandwidth, camQualityPicture, avatarURL);    
      }
    }

    /**
     * Stop previewing user's webcam.
     */ 
    CAM_PREVIEW.stopPreviewCamera = function(avatarURL) {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.stopPreviewCamera(avatarURL);    
      }
    }
    
    console.log("CAM_PREVIEW INITIALIZED");
        
    window.CAM_PREVIEW = CAM_PREVIEW;
})(this);

