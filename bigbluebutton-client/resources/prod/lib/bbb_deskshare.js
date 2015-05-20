if (!window.console) window.console = {};
if (!window.console.log) window.console.log = function () { };

function startApplet(IP, useTLS , roomNumber, fullScreen, useSVC2)
{
        console.log("Starting deskshare applet.");
        var div = document.createElement("div");
        div.id = "deskshare";

        div.innerHTML =
                "<applet code=\"org.bigbluebutton.deskshare.client.DeskShareApplet.class\"" +
                        "id=\"DeskShareApplet\" width=\"100\" height=\"10\" archive=\"bbb-deskshare-applet-0.9.0.jar\">" +
                        "<param name=\"ROOM\" value=\"" + roomNumber  + "\"/>" +
                        "<param name=\"IP\" value=\"" + IP + "\"/>" +
                        "<param name=\"useTLS\" value=\"" + useTLS + "\"/>" +
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

function appletStartupCallback() {
        BBB.javaAppletLaunched();
}

function getHighestJavaVersion(javas) {
  var highestJava = javas[0];
    console.log("highestJava = [" + highestJava + "]");
  for (j = 0; j < javas.length; j++) {
    var java = javas[j];
    console.log("java[" + j + "]=[" + java + "]");
    var highest  = highestJava.split(".");
    console.log(highest);
    var iter = java.split(".");
    console.log(iter);
        
    if (parseInt(iter[0]) > parseInt(highest[0])) {
      highestJava = java;
    } else if (parseInt(iter[0]) == parseInt(highest[0]) && parseInt(iter[1]) > parseInt(highest[1])) {
      highestJava = java;
      console.log(highestJava);
    } else if (parseInt(iter[0]) == parseInt(highest[0]) && parseInt(iter[1]) == parseInt(highest[1])) {
      var iterMinor  = parseInt((iter[2]).split("_")[1]);
      var highestMinor = parseInt((highest[2]).split("_")[1]);
      if (iterMinor > highestMinor) {
        highestJava = java;
        console.log(highestJava);
      }
    }
  }

    return highestJava;    
}

function getIcedTeaWebVersion() {
    for (i = 0; i < navigator.plugins.length; i++) { 
        var matches; 
        if (matches = navigator.plugins[i].name.match(/using IcedTea-Web ([0-9.]+)/)) {
            return matches[1];
        }
    }
    return null;
} 

function isJavaVersionOk(installedVersion, minVersion) {
  var required = minVersion.split(".");
  highest = installedVersion.split(".");
  if (parseInt(required[0]) > parseInt(highest[0])) {
    console.log("older major version=[" + installedVersion + "]");
    return {result: "JAVA_OLDER", version: installedVersion};
  } else if (parseInt(required[0]) == parseInt(highest[0]) && parseInt(required[1]) > parseInt(highest[1])) {
    console.log("older minor version=[" + installedVersion + "]");
    return {result: "JAVA_OLDER", version: installedVersion};
  } else if (parseInt(required[0]) == parseInt(highest[0]) && parseInt(required[1]) == parseInt(highest[1])) {
    var requiredMinor  = parseInt((required[2]).split("_")[1]);
    var highestJavaMinor = parseInt((highest[2]).split("_")[1]);
    if (requiredMinor > highestJavaMinor) {
      console.log("older update version=[" + installedVersion + "]");
      return {result: "JAVA_OLDER", version: installedVersion};
    }
  }
    
    return {result: "JAVA_OK"};
}

function isIcedTeaVersionOkLinux(installedVersion, minVersion) {
  var required = minVersion.split(".");
  highest = installedVersion.split(".");
  if (parseInt(required[0]) > parseInt(highest[0])) {
    console.log("ice: older major version=[" + installedVersion + "]");
    return {result: "JAVA_OLDER", version: installedVersion};
  } else if (parseInt(required[0]) == parseInt(highest[0]) && parseInt(required[1]) > parseInt(highest[1])) {
    console.log("ice: older minor version=[" + installedVersion + "]");
    return {result: "JAVA_OLDER", version: installedVersion}; 
  }
  
  return {result: "JAVA_OK"};
}

function checkJavaVersion(minJavaVersion) {               
    var javas = deployJava.getJREs(); 
    var highestJavaVersion = null;
    
    if (javas == null || javas.length == 0) {
       if (javas == null) {
            return {result:"JAVA_NOT_DETECTED"};
       }
                        
       if (javas.length == 0) {
            return {result: "JAVA_NOT_INSTALLED"};
       }        
    } else {       
      var highestJavaVersion = getHighestJavaVersion(javas);
      var isOk = isJavaVersionOk(highestJavaVersion, minJavaVersion);
      if (isOk.result === "JAVA_OLDER") {
          highestJavaVersion = getIcedTeaWebVersion();
          return isIcedTeaVersionOkLinux(highestJavaVersion, "1.5.0");
      } else {
        return isOk;
      }
    }

}