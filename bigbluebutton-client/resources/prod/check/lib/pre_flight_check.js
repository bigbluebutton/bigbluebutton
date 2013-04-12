
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