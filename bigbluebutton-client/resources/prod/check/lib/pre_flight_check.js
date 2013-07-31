var registerListeners = function() {
  console.log("Listening for events.");
  BBBCheck.listen("MicCheckAppReadyEvent", function() {
    console.log("Received [MicCheckAppReadyEvent].");
  });
  BBBCheck.listen("NewRoleEvent", function(bbbCheckEvent) {
    console.log("New Role Event [amIPresenter=" + bbbCheckEvent.amIPresenter + ",role=" + bbbCheckEvent.role + ",newPresenterUserID=" + bbbCheckEvent.newPresenterUserID + "].");
  });
}


var bbbCheckFlashVersion = function() {
  var playerVersion = BBBCheck.getFlashPlayerVersion();
  console.log("You have Flash player " + playerVersion.major + "." + playerVersion.minor + "." + playerVersion.release + " installed");
}

var bbbHasMinFlashVersion = function(version) {
  console.log("Q: Do I have Flash player 9.0.18 or higher installed?\nA: " + BBBCheck.hasMinFlashPlayerVersion(version));
}

var bbbGetBrowser = function() {
  console.log("Browser = " + BBBCheck.getBrowser());
}

var bbbGetJREs = function() {
  console.log("JREs = " + BBBCheck.getJREs());
}

var bbbCheckShowMicSettings = function() {
  BBBCheck.showMicSettings();
}

var bbbCheckStartTestMic = function() {
  BBBCheck.startTestMicrophone();
}

var bbbCheckStopTestMic = function() {
  BBBCheck.stopTestMicrophone();
}

var bbbCheckShowCamSettings = function() {
  BBBCheck.showCamSettings();
}

var bbbCheckTestRTMPConnection = function(host, app) {
  BBBCheck.testRTMPConnection(host, app);
}

var bbbCheckTestSocketConnection = function(host, port) {
  BBBCheck.testSocketConnection(host, port);
}

var bbbCheckSetSocketPolicyFileURL = function(url) {
  BBBCheck.setSocketPolicyFileURL(url);
}
