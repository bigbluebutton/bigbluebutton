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
	else if (browser == "Microsoft Internet Explorer"){
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
	else if (browser == "Microsoft Internet Explorer"){
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
	else if (browser == "Microsoft Internet Explorer"){
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
	// Browser name extraction code provided by http://www.javascripter.net/faq/browsern.htm
	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName  = navigator.appName;
	var fullVersion  = ''+parseFloat(navigator.appVersion); 
	var majorVersion = parseInt(navigator.appVersion,10);
	var nameOffset,verOffset,ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset+4);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset+5);
	}
	// In Puffin, the true version is after "Puffin" in userAgent
	else if ((verOffset=nAgt.indexOf("Puffin"))!=-1) {
		browserName = "Puffin";
		fullVersion = nAgt.substring(verOffset+7);
	}
	// search for Edge before Chrome or Safari because Microsoft
	// includes Chrome and Safari user agents in Edge's UA
	// In Microsoft Edge, the true version is the last chunk of the UA
	// it follows "Edge"
	else if ((verOffset=nAgt.indexOf("Edge"))!=-1) {
		browserName = "Edge";
		// "Edge".length = 4, plus 1 character for the trailing slash
		fullVersion = nAgt.substring(verOffset+5);
	}
	// In Chrome, the true version is after "Chrome" 
	else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset+7);
	}
	// In Safari, the true version is after "Safari" or after "Version" 
	else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset+7);
		if ((verOffset=nAgt.indexOf("Version"))!=-1) 
			fullVersion = nAgt.substring(verOffset+8);
	}
	// In Firefox, the true version is after "Firefox" 
	else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset+8);
	}
	// In most other browsers, "name/version" is at the end of userAgent 
	else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < (verOffset=nAgt.lastIndexOf('/')) ) 
	{
		 browserName = nAgt.substring(nameOffset,verOffset);
		 fullVersion = nAgt.substring(verOffset+1);
		 if (browserName.toLowerCase()==browserName.toUpperCase()) {
			 browserName = navigator.appName;
		 }
	}
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
	
	return [browserName, majorVersion, fullVersion];
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
