<!--

BigBlueButton - http://www.bigbluebutton.org

Copyright (c) 2008-2018 by respective authors (see below). All rights reserved.

BigBlueButton is free software; you can redistribute it and/or modify it under the 
terms of the GNU Lesser General Public License as published by the Free Software 
Foundation; either version 3 of the License, or (at your option) any later 
version. 

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along 
with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

Authors: James Jung
         Anton Georgiev

-->

<%@ page language="java" contentType="text/html; charset=UTF-8"
        pageEncoding="UTF-8"%>
<%
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Join Meeting via HTML5 Client (API)</title>
        <style>
                #controls {
                        width:50%;
                        height:200px;
                        float:left;
                }
                .control {

                }
                #output {
                        width:50%;
                        height:200px;
                        float:right;
                }
                #client {
                        width:100%;
                        height:700px;
                        float:left;
                }
                #client-content {
                        width:100%;
                        height:100%;
                }
        </style>
</head>

<body>

<p>You must have the BigBlueButton HTML5 client installed to use this API demo.</p>

<%@ include file="bbb_api.jsp"%>

<%
if (request.getParameterMap().isEmpty()) {
        //
        // Assume we want to create a meeting
        //
        %>
<%@ include file="demo_header.jsp"%>

<h2>Join Meeting via HTML5 Client (API)</h2>

<FORM NAME="form1" METHOD="GET">
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
        <tbody>
                <tr>
                        <td>&nbsp;</td>
                        <td style="text-align: right; ">Full Name:</td>
                        <td style="width: 5px; ">&nbsp;</td>
                        <td style="text-align: left "><input type="text" autofocus required name="username" /></td>
                </tr>

                <tr>
                        <td>&nbsp;</td>
                        <td style="text-align: right; ">Meeting Name:</td>
                        <td style="width: 5px; ">&nbsp;</td>
                        <td style="text-align: left "><input type="text" required name="meetingname" value="Demo Meeting" /></td>
                <tr>

                <tr>
                        <td>&nbsp;</td>
                        <td style="text-align: right; ">Moderator Role:</td>
                        <td style="width: 5px; ">&nbsp;</td>
                        <td style="text-align: left "><input type=checkbox name=isModerator value="true" checked></td>
                <tr>

                <tr>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td><input type="submit" value="Join" /></td>
                <tr>
        </tbody>
</table>
<INPUT TYPE=hidden NAME=action VALUE="create">
</FORM>


<%
} else if (request.getParameter("action").equals("create")) {

        String username = request.getParameter("username");

        // set defaults and overwrite them if custom values exist
        String meetingname = "Demo Meeting";
        if (request.getParameter("meetingname") != null) {
                meetingname = request.getParameter("meetingname");
        }

        Boolean isModerator = new Boolean(false);
        Boolean isHTML5 = new Boolean(true);
        Boolean isRecorded = new Boolean(true);
        if (request.getParameter("isModerator") != null) {
                isModerator = Boolean.parseBoolean(request.getParameter("isModerator"));
        }

        String joinURL = getJoinURLExtended(username, meetingname, isRecorded.toString(), null, null, null, isHTML5.toString(), isModerator.toString());

        if (joinURL.startsWith("http://") || joinURL.startsWith("https://")) {
%>

<script language="javascript" type="text/javascript">
        //EventListener(Getting message from iframe)
        window.addEventListener('message', function(e) {
		console.error('message: ', e);
                document.getElementById("output-content").innerHTML = JSON.stringify(e.data.response);
                // document.getElementById("output-content").innerHTML = e.data.response;
        });

        /********************functions for the controls************************/
        //Toggle Recording
        function recToggle(){
                document.getElementById("client-content").contentWindow.postMessage("c_record","*");
        }

	// Toggle muting
	function muteToggle(){
                document.getElementById("client-content").contentWindow.postMessage("c_mute","*");
        }
        ///////////////////////////////////////////////////////////////////////

        //Clean up the body node before loading controls and the client
        console.log("Join URL = <%=joinURL%>");

        document.body.innerHTML = "";

        //Node for the Client
        var client = document.createElement("div");
        client.setAttribute("id","client");

        var clientContent = document.createElement("iframe");
        clientContent.setAttribute("id","client-content");
        clientContent.setAttribute("src","<%=joinURL%>");
        // clientContent.setAttribute("src","https://MYDOMAIN.com/demo/demoHTML5.jsp");
        // clientContent.setAttribute("allow","microphone https://MYDOMAIN.com; camera https://MYDOMAIN.com");

        client.appendChild(clientContent);

        //Node for the Controls
        var controls = document.createElement("div");
        controls.setAttribute("id","controls");
        controls.setAttribute("align","middle");
        controls.setAttribute("float","left");

        /****************** Controls *****************************/
        //Node for the control which controls recording functionality of the html5Client
        var recButton = document.createElement("button");
        recButton.innerHTML = "Start/Stop Recording";
        recButton.setAttribute("onClick","recToggle();");

        controls.appendChild(recButton);


	var muteButton = document.createElement("button");
        muteButton.innerHTML = "Toggle mute";
        muteButton.setAttribute("onClick","muteToggle();");

        controls.appendChild(muteButton);

        //////////////////////////////////////////////////////////

        //Node for the output screen
        var output = document.createElement("div");
        output.setAttribute("id","output");
        output.setAttribute("align","middle");

        var outputContent = document.createElement("textarea");
        outputContent.setAttribute("id","output-content");
        outputContent.setAttribute("rows","4");
        outputContent.setAttribute("cols","50");

        output.appendChild(outputContent);

        //Append the nodes of contents to the body node
        document.body.appendChild(controls);
        document.body.appendChild(output);
        document.body.appendChild(client);
</script>
<%
        } else {
%>

Error: getJoinURL() failed
<p/>
<%=joinURL %>

<%
        }
}
%>

<%@ include file="demo_footer.jsp"%>

</body>
</html>


