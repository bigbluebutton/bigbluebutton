if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

function startApplet(IP, roomNumber, fullScreen, useSVC2)
{
        console.log("Starting deskshare applet.");
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
}

function removeFrame () {
        var div = document.getElementById("deskshare");
        if (div.parentNode) {
          // Need to set the innerHTML otherwise the applet will restart in IE.
          // see https://code.google.com/p/bigbluebutton/issues/detail?id=1776
          div.innerHTML = "";
          div.parentNode.removeChild(div);
        }
}

function setScreenCoordinates(x, y) {
        document.DeskShareApplet.setScreenCoordinates(x,y);
}

function stopApplet(){
        console.log("Stopping deskshare applet.");
        removeFrame();
}

function checkForJava(){
//      if (navigator.javaEnabled() || window.navigator.javaEnabled())
                return 1;
}
