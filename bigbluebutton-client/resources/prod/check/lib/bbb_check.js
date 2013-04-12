(function(window, undefined) {

  var BBBCheck = {};

  BBBCheck.getFlashPlayerVersion = function() {
    return swfobject.getFlashPlayerVersion();
  }
  
  BBBCheck.hasMinFlashPlayerVersion = function(flashVersion) {
     return swfobject.hasFlashPlayerVersion(flashVersion);
  }
  
  

  window.BBBCheck = BBBCheck;
})(this);
 