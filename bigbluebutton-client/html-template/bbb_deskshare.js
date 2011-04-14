function startApplet(IP, roomNumber, fullScreen)
{
        var iframe = document.createElement("iframe");
        iframe.id = "iframe";
        document.body.appendChild(iframe);
        frames[frames.length - 1].document.write(
                "<applet code=\"org.bigbluebutton.deskshare.client.DeskShareApplet.class\"" +
                        "id=\"DeskShareApplet\" width=\"0\" height=\"400\" archive=\"bbb-deskshare-applet-0.71.jar\">" +
                "<param name=\"ROOM\" value=\"" + roomNumber  + "\"/>" +
                "<param name=\"IP\" value=\"" + IP + "\"/>" +
                "<param name=\"FULL_SCREEN\" value=\"" + fullScreen + "\"/>" +          
        "</applet>"
     );
}

function removeFrame () {
    var iframe = document.getElementById("iframe");
    iframe.parentNode.removeChild(iframe);
}

function setScreenCoordinates(x, y) {
   return frames[frames.length - 1].document.DeskShareApplet.setScreenCoordinates(x,y);
}

function stopApplet(){
        frames[frames.length - 1].document.DeskShareApplet.destroy();
        removeFrame();
}

function checkForJava(){
//      if (navigator.javaEnabled() || window.navigator.javaEnabled())
                return 1;
}
