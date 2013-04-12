(function(window, undefined) {

  var BBBCheck = {};

  BBBCheck.getFlashPlayerVersion = function() {
    return swfobject.getFlashPlayerVersion();
  }
  
  BBBCheck.hasMinFlashPlayerVersion = function(flashVersion) {
     return swfobject.hasFlashPlayerVersion(flashVersion);
  }
  
  BBBCheck.getBrowser = function() {
    return deployJava.getBrowser();
  }
  
  BBBCheck.getJREs = function() {
    return deployJava.getJREs();
  }
  
  BBBCheck.installJRE = function(version) {
    deployJava.installJRE(version);
  }
  
  BBBCheck.installLatestJRE = function() {
    deployJava.installLatestJRE();
  }
  
  BBBCheck.runApplet = function(attributes, parameters, minimumVersion) {
    deployJava.runApplet(attributes, parameters, minimumVersion);
  }

  window.BBBCheck = BBBCheck;
})(this);
 