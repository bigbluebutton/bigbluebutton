function startScreensharing(jnlp, meetingId, authToken, fullScreen)
{
  console.log("Starting JSW [" + authToken + "]");
  var launchuri = jnlp + "?authToken=" + authToken + "&fullScreen=" + fullScreen + "&meetingId=" + meetingId;

  $('<iframe id="iframe"><iframe/>').attr('src', launchuri).hide().appendTo('body');
}

        
function removeFrame () {
        var div = document.getElementById("deskshare");
        div.parentNode.removeChild(div);
}

function setScreenCoordinates(x, y) {
        document.DeskShareApplet.setScreenCoordinates(x,y);
}

function stopApplet(){
        document.DeskShareApplet.destroy();
        removeFrame();
}

function checkForJava(){
//      if (navigator.javaEnabled() || window.navigator.javaEnabled())
                return 1;
}
