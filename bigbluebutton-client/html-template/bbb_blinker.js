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

