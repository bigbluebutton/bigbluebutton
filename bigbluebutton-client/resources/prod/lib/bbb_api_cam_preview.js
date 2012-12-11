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
    CAM_PREVIEW.previewCamera = function(camIndex, camWidth, camHeight) {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.previewCamera(camIndex, camWidth, camHeight);    
      }
    }

    /**
     * Stop previewing user's webcam.
     */ 
    CAM_PREVIEW.stopPreviewCamera = function() {
      var swfObj = getSwfObj();
      if (swfObj) {
          swfObj.stopPreviewCamera();    
      }
    }
        
    window.CAM_PREVIEW = CAM_PREVIEW;
})(this);

