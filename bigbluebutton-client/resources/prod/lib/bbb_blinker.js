function setTitle(title){
    document.title= "BigBlueButton - " + title;
}

function clientReady(message){
	var target = document.getElementById("clientReady");
	if (target) target.innerHTML = message;
}

function setProgressBar(percent){
	var bar = document.getElementById("accessibile-progress");
	if (bar) {
		bar.setAttribute("aria-valuenow", percent);
		bar.innerHTML = percent + " " + "%";
	}
}

function removeProgressBar(){
	var bar = document.getElementById("accessibile-progress");
	if (bar) bar.parentNode.removeChild(bar);
}

function determineModifier()
{
	var browser = determineBrowser()[0];
	var modifier;
	if (browser == "Firefox"){
		modifier = "control+";
	}
	else if (browser == "Chrome"){
		modifier = "control+";
	}
	else if (browser == "Internet Explorer"){
		modifier = "control+shift+";
	}
	//else if (browser == "Safari"){
	//	modifier = "control+shift+";
	//}
	else{
		modifier = "control+shift+";
	}
	return modifier;
}

function determineGlobalModifier()
{
	var browser = determineBrowser()[0];
	var modifier;
	if (browser == "Firefox"){
		modifier = "control+shift+";
	}
	else if (browser == "Chrome"){
		modifier = "control+shift+";
	}
	else if (browser == "Internet Explorer"){
		modifier = "control+alt+";
	}
	//else if (browser == "Safari"){
	//	modifier = "control+alt";
	//}
	else{
		modifier = "control+alt+";
	}
	return modifier;
}

function determineGlobalAlternateModifier()
{
	var browser = determineBrowser()[0];
	var modifier;
	if (browser == "Firefox"){
		modifier = "control+";
	}
	else if (browser == "Chrome"){
		modifier = "control+";
	}
	else if (browser == "Internet Explorer"){
		modifier = "control+shift+";
	}
	//else if (browser == "Safari"){
	//	modifier = "control+alt";
	//}
	else{
		modifier = "control+shift+";
	}
	return modifier;
}

function determineBrowser()
{
	var browserName = bowser.name;
	var fullVersion = bowser.version;
	var userAgent = navigator.userAgent;
	
	// trim the fullVersion string at semicolon/space if present
	if ((ix=fullVersion.indexOf(";"))!=-1)
		fullVersion=fullVersion.substring(0,ix);
	if ((ix=fullVersion.indexOf(" "))!=-1)
		fullVersion=fullVersion.substring(0,ix);

	majorVersion = parseInt(''+fullVersion,10);
	if (isNaN(majorVersion)) {
		fullVersion  = ''+parseFloat(navigator.appVersion); 
		majorVersion = parseInt(navigator.appVersion,10);
	}
	
	return [browserName, majorVersion, fullVersion, userAgent];
}

function toggleFullscreen() {

	function isFullscreen() {
		return !!(document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement);
	}

	function exitFullscreen() {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		} else if (document.webkitExitFullscreen) {
			document.webkitExitFullscreen();
		} else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		} else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}

	function setFullscreen() {
		var htmlElement = document.getElementById("content");

		if (htmlElement.requestFullscreen) {
			htmlElement.requestFullscreen();
		} else if (htmlElement.webkitRequestFullscreen) {
			htmlElement.webkitRequestFullscreen();
		} else if (htmlElement.mozRequestFullScreen) {
			htmlElement.mozRequestFullScreen();
		} else if (htmlElement.msRequestFullscreen) {
			htmlElement.msRequestFullscreen();
		}
	}

	function FShandler() {
		var isNowFullscreen = isFullscreen();
		var swfObj = swfobject.getObjectById("BigBlueButton");
		if (swfObj) {
			swfObj.fullscreenToggled(isNowFullscreen);
		}
	}

	// remove old listeners
	document.removeEventListener("fullscreenchange", FShandler);
	document.removeEventListener("webkitfullscreenchange", FShandler);
	document.removeEventListener("mozfullscreenchange", FShandler);
	document.removeEventListener("MSFullscreenChange", FShandler);

	// add listeners
	document.addEventListener("fullscreenchange", FShandler);
	document.addEventListener("webkitfullscreenchange", FShandler);
	document.addEventListener("mozfullscreenchange", FShandler);
	document.addEventListener("MSFullscreenChange", FShandler);

	// are we currently in full-screen mode?
	if (isFullscreen()) {
		exitFullscreen();
	} else {
		setFullscreen()
	}
}
