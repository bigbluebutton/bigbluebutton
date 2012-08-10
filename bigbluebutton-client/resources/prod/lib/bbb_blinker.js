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

function determineBrowser()
{
    return navigator.appName;
}