var blinkTimer = false;
var blinking = false;

var startblink = function(message1, message2)
{
        if(!blinking)
        {
                document.title = (document.title == message2)?message1:message2;
                blinkTimer = window.setTimeout("blinktitle('" + message1 + "', '" + message2 + "', 1)", 500);
                blinking = true;
        }
}

var blinktitle = function(message1, message2)
{
        document.title = (document.title == message2)?message1:message2;
        blinkTimer = window.setTimeout("blinktitle('" + message1 + "', '" + message2 + "', 1)", 500);
}

var clearblink = function()
{
        blinking = false;
        if(blinkTimer)
        {
                window.clearTimeout(blinkTimer);
        }
        document.title = 'BigBlueButton';
}

var i = 1;
function addAlert(message){
	var target = document.getElementById( 'notifications' ),
    contentDiv = document.createElement( "div" );	
	contentDiv.id = "alertDiv" + i;
	i++;
	//contentDiv.innerHTML = "<p>" + message + "</p>";
	contentDiv.innerHTML = message;
	contentDiv.style.display = "block";
	target.appendChild( contentDiv );
	target.hide();
	target.setAttribute("role","alert");
	target.show();
	contentDiv.hide();
	contentDiv.setAttribute("role","alert");
	contentDiv.show();
}

function determineModifier()
{
	var browser = determineBrowser();
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
	var browser = determineBrowser();
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
	if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset+6);
		if ((verOffset=nAgt.indexOf("Version"))!=-1) 
			fullVersion = nAgt.substring(verOffset+8);
	}
	// In MSIE, the true version is after "MSIE" in userAgent
	else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
		browserName = "Microsoft Internet Explorer";
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
	
	return browserName;
}