function startApplet(IP, roomNumber, fullScreen, useSVC2)
{
        console.log("isJavaEnabled? " + isJavaEnabled());
        console.log("isJavaVersionAppropriateForDeskshare? " + isJavaVersionAppropriateForDeskshare());

        var div = document.createElement("div");
        div.id = "deskshare";

        div.innerHTML =
                "<applet code=\"org.bigbluebutton.deskshare.client.DeskShareApplet.class\"" +
                        "id=\"DeskShareApplet\" width=\"100\" height=\"10\" archive=\"bbb-deskshare-applet-0.9.0.jar\">" +
                        "<param name=\"ROOM\" value=\"" + roomNumber  + "\"/>" +
                        "<param name=\"IP\" value=\"" + IP + "\"/>" +
                        "<param name=\"PORT\" value=\"9123\"/>" +
                        "<param name=\"SCALE\" value=\"0.8\"/>" +
                        "<param name=\"FULL_SCREEN\" value=\"" + fullScreen + "\"/>" +
                        "<param name=\"SVC2\" value=\"" + useSVC2 + "\"/>" +
                        "<param name=\"JavaVersion\" value=\"1.7.0_51\"/>" +
                        "<param name=\"permissions\" value=\"all-permissions\"/>" +
                "</applet>";
        document.body.appendChild(div);

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
        var div = document.getElementById("deskshare");
        div.parentNode.removeChild(div);
}

function setScreenCoordinates(x, y) {
        document.DeskShareApplet.setScreenCoordinates(x,y);
}

function stopApplet(){
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
