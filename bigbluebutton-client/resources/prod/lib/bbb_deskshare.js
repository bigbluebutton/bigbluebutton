function startApplet(IP, roomNumber, fullScreen, useSVC2)
{
        console.log("isJavaEnabled? " + isJavaEnabled());
        console.log("isJavaVersionAppropriateForDeskshare? " + isJavaVersionAppropriateForDeskshare());

        var iframe = document.createElement("iframe");
        iframe.id = "iframe";
        document.body.appendChild(iframe);
        frames[frames.length - 1].document.write(
                "<applet code=\"org.bigbluebutton.deskshare.client.DeskShareApplet.class\"" +
                        "id=\"DeskShareApplet\" width=\"0\" height=\"1\" archive=\"bbb-deskshare-applet-0.8.1.jar\">" +
                "<param name=\"ROOM\" value=\"" + roomNumber  + "\"/>" +
                "<param name=\"IP\" value=\"" + IP + "\"/>" +
                "<param name=\"PORT\" value=\"9123\"/>" +
                "<param name=\"SCALE\" value=\"0.8\"/>" +
                "<param name=\"FULL_SCREEN\" value=\"" + fullScreen + "\"/>" +
                "<param name=\"SVC2\" value=\"" + useSVC2 + "\"/>" +
                "<param name=\"permissions\" value=\"all-permissions\"/>" +
        "</applet>"
     );

    var attributes = {
            code: 'org.bigbluebutton.deskshare.client.DeskShareApplet.class',
            id: 'DeskShareApplet',
            width: '0',
            height: '1',
            archive: 'bbb-deskshare-applet-0.8.1.jar' };
    var parameters = {
            ROOM: roomNumber,
            IP: IP,
            PORT: '9123',
            SCALE: '0.8',
            FULL_SCREEN: fullScreen,
            SVC2: useSVC2,
            permissions: 'all-permissions' };
    var version = '1.7.0_51';
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

var isJavaEnabled = function() {
    return typeof(navigator.javaEnabled) !== 'undefined' && navigator.javaEnabled();
}

var isJavaVersionAppropriateForDeskshare = function() {
    var required = '1.7.0_51+';
    deployJava.init();
    return deployJava.versionCheck(required);
}