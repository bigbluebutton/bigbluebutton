<!--

BigBlueButton - http://www.bigbluebutton.org

Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.

BigBlueButton is free software; you can redistribute it and/or modify it under the 
terms of the GNU Lesser General Public License as published by the Free Software 
Foundation; either version 3 of the License, or (at your option) any later 
version. 

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along 
with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

Author: Fred Dixon <ffdixon@bigbluebutton.org>
  
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
	<meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7" />
	<title>Create Your Own Meeting</title>

	<script type="text/javascript"
		src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/heartbeat.js"></script>
</head>
<body>


<%@ include file="bbb_api.jsp"%>
<%@ page import="java.util.regex.*"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>


<br>

<%
	if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to create a meeting
		//
%>
<%@ include file="demo_header.jsp"%>
<h2>Create Your Own Meeting</h2>

<p />
<FORM NAME="form1" METHOD="GET">

<table width=600 cellspacing="20" cellpadding="20"
	style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"
	border=3>
	<tbody>
		<tr>
			<td width="50%">Create your own meeting.
			<p />
			</td>
			<td width="50%">Step 1. Enter your name: <input type="text" autofocus required
				name="username1" /> <br />
			<INPUT TYPE=hidden NAME=action VALUE="create"> <br />
			<input id="submit-button" type="submit" value="Create meeting" /></td>
		</tr>
	</tbody>
</table>

</FORM>

<script>
//
// We could have asked the user for both their name and a meeting title, but we'll just use their name to create a title
// We'll use JQuery to dynamically update the button
//
$(document).ready(function(){
    $("input[name='username1']").keyup(function() {
        if ($("input[name='username1']").val() == "") {
        	$("#submit-button").attr('value',"Create meeting" );
        } else {
       $("#submit-button").attr('value',"Create " +$("input[name='username1']").val()+ "'s meeting" );
        }
    });
});
</script>

<%
	} else if (request.getParameter("action").equals("create")) {
		//
		// User has requested to create a meeting
		//

		String username = request.getParameter("username1");
		String meetingID = username + "'s meeting";

		//
		// This is the URL for to join the meeting as moderator
		//
		String joinURL = getJoinURL(username, meetingID, "false", "<br>Welcome to %%CONFNAME%%.<br>", null, null);

		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String inviteURL = url + "create.jsp?action=invite&meetingID=" + URLEncoder.encode(meetingID, "UTF-8");
%>

<hr />
<h2>Meeting Created</h2>
<hr />


<table width="800" cellspacing="20" cellpadding="20"
	style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"
	border=3>
	<tbody>
		<tr>
			<td width="50%">
                        <center><strong> <%=StringEscapeUtils.escapeXml(username)%>'s meeting</strong> has been
			created.</center>
			</td>

			<td width="50%">
			<p>&nbsp;</p>

			Step 2. Invite others using the following <a href="<%=inviteURL%>">link</a> (shown below):
			<form name="form2" method="POST">
				<textarea cols="62" rows="5" name="myname" style="overflow: hidden">
					<%=inviteURL%>
				</textarea>
			</form>
			<p>&nbsp;
			<p />Step 3. Click the following link to start your meeting:
			<p>&nbsp;</p>
			<center><a href="<%=joinURL%>">Start Meeting</a></center>
			<p>&nbsp;</p>

			</td>
		</tr>
	</tbody>
</table>







<%
	} else if (request.getParameter("action").equals("enter")) {
		//
		// The user is now attempting to joing the meeting
		//
		String meetingID = request.getParameter("meetingID");
		String username = request.getParameter("username");

		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String enterURL = url + "create.jsp?action=join&username="
			+ URLEncoder.encode(username, "UTF-8") + "&meetingID="
			+ URLEncoder.encode(meetingID, "UTF-8");

		if (isMeetingRunning(meetingID).equals("true")) {
			//
			// The meeting has started -- bring the user into the meeting.
			//
%>
<script type="text/javascript">
	window.location = "<%=enterURL%>";
</script>
<%
	} else {
			//
			// The meeting has not yet started, so check until we get back the status that the meeting is running
			//
			String checkMeetingStatus = getURLisMeetingRunning(meetingID);
%>

<script type="text/javascript">
$(document).ready(function(){
		$.jheartbeat.set({
		   url: "<%=checkMeetingStatus%>",
		   delay: 5000
		}, function () {
			mycallback();
		});
	});


function mycallback() {
	// Not elegant, but works around a bug in IE8 
	var isMeetingRunning = ($("#HeartBeatDIV").text().search("true") > 0 );

	if (isMeetingRunning) {
		window.location = "<%=enterURL%>"; 
	}
}
</script>

<hr />
<h2><strong><%=meetingID%></strong> has not yet started.</h2>
<hr />


<table width=600 cellspacing="20" cellpadding="20"
	style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"
	border=3>
	<tbody>
		<tr>
			<td width="50%">

                        <p>Hi <%=StringEscapeUtils.escapeXml(username)%>,</p>
			<p>Now waiting for the moderator to start <strong><%=meetingID%></strong>.</p>
			<br />
			<p>(Your browser will automatically refresh and join the meeting
			when it starts.)</p>
			</td>
			<td width="50%"><img src="polling.gif"></img></td>
		</tr>
	</tbody>
</table>


<%
}
	} else if (request.getParameter("action").equals("invite")) {
		//
		// We have an invite to an active meeting.  Ask the person for their name 
		// so they can join.
		//
		String meetingID = request.getParameter("meetingID");
%>

<hr />
<h2>Invite</h2>
<hr />

<FORM NAME="form3" METHOD="GET">

<table width=600 cellspacing="20" cellpadding="20"
	style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);"
	border=3>
	<tbody>
		<tr>
			<td width="50%">

			<p />You have been invited to join<br />
			<strong><%=meetingID%></strong>.
			</td>

			<td width="50%">Enter your name: <input type="text"
				name="username" /> <br />
			<INPUT TYPE=hidden NAME=meetingID VALUE="<%=meetingID%>"> <INPUT
				TYPE=hidden NAME=action VALUE="enter"> <br />
			<input type="submit" value="Join" /></td>
		</tr>
	</tbody>
</table>

</FORM>




<%
	} else if (request.getParameter("action").equals("join")) {
		//
		// We have an invite request to join an existing meeting and the meeting is running
		//
		// We don't need to pass a meeting descritpion as it's already been set by the first time 
		// the meeting was created.
		String joinURL = getJoinURLViewer(request.getParameter("username"), request.getParameter("meetingID"));
			
		if (joinURL.startsWith("http://") || joinURL.startsWith("https://")) {
%>

<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
</script>

<%
	} else { 
%>

Error: getJoinURL() failed
<p /><%=joinURL%> 

<%
 	}
 }
 %> 

<%@ include file="demo_footer.jsp"%>

</body>
</html>
