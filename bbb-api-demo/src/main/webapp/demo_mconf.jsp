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
	<title>Mconf-Live Demo</title>
	<link rel="stylesheet" href="css/mconf-bootstrap.min.css" type="text/css" />
</head>
<body>

<%@ include file="bbb_api.jsp"%>

<% 

//
// We're going to define some sample courses (meetings) below.  This API exampe shows how you can create a login page for a course. 
// The password below are not available to users as they are compiled on the server.
//

HashMap<String, HashMap> allMeetings = new HashMap<String, HashMap>();
HashMap<String, String> meeting;

// String welcome = "<br>Welcome to %%CONFNAME%%!<br><br>For help see our <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>tutorial videos</u></a>.<br><br>To join the voice bridge for this meeting:<br>  (1) click the headset icon in the upper-left, or<br>  (2) dial xxx-xxx-xxxx (toll free:1-xxx-xxx-xxxx) and enter conference ID: %%CONFNUM%%.<br><br>";

String welcome = "<br>Welcome to <b>%%CONFNAME%%</b>!<br><br>In order to speak, click on the headset icon.";

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 1", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72013");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 2", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72014");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 3", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72015");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 4", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72016");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = null;

Iterator<String> meetingIterator = new TreeSet<String>(allMeetings.keySet()).iterator();

if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to join a course
		//
	%> 

<div style="width: 400px; margin: 0px auto; margin-top: 100px; ">
	<div style="text-align: center; margin-bottom: 35px; ">
		<h1>Mconf-Live Demo</h1>
	</div>

	<FORM NAME="form1" METHOD="GET">
	<table cellpadding="3" cellspacing="5">
		<tbody>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Full&nbsp;Name:</td>
				<td style="width: 5px; ">
					&nbsp;</td>
				<td style="text-align: left ">
					<input type="text" autofocus required name="username" /></td>
			</tr>
			
		
			
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Session:</td>
				<td>
					&nbsp;
				</td>
				<td style="text-align: left ">
				<select name="meetingID">
				<%
					String key;
					while (meetingIterator.hasNext()) {
						key = meetingIterator.next(); 
						out.println("<option value=\"" + key + "\">" + key + "</option>");
					}
				%>
				</select>
					
				</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Role:</td>
				<td>
					&nbsp;</td>
				<td>
					<input type="radio" name="password" value="prof123" text"Moderator" checked>Moderator</input>
					<input type="radio" name="password" value="student123">Viewer</input>
				</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Guest:</td>
				<td>
					&nbsp;</td>
				<td>
					<input type="checkbox" name="guest" value="guest" />&nbsp;&nbsp;&nbsp;(authorization required)</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td>
					&nbsp;</td>
				<td>
					&nbsp;</td>
				<td>
					<input type="submit" value="Join" style="width: 220px; "></td>
			</tr>	
		</tbody>
	</table>
	<INPUT TYPE=hidden NAME=action VALUE="create">
	</FORM>
</div>
<%
	} else if (request.getParameter("action").equals("create")) {
		//
		// Got an action=create
		//

		String username = request.getParameter("username");
		String meetingID = request.getParameter("meetingID");
		String password = request.getParameter("password");
		
		meeting = allMeetings.get( meetingID );
		
		String welcomeMsg = meeting.get( "welcomeMsg" );
		String logoutURL = meeting.get( "logoutURL" );
		Integer voiceBridge = Integer.parseInt( meeting.get( "voiceBridge" ).trim() );

		String viewerPW = meeting.get( "viewerPW" );
		String moderatorPW = meeting.get( "moderatorPW" );
		
		//
		// Check if we have a valid password
		//
		if ( ! password.equals(viewerPW) && ! password.equals(moderatorPW) ) {
%>

Invalid Password, please <a href="javascript:history.go(-1)">try again</a>.

<%
			return;
		}
		
		//
		// Looks good, let's create the meeting
		//
		String meeting_ID = createMeeting( meetingID, welcomeMsg, moderatorPW, viewerPW, voiceBridge, logoutURL );
		
		//
		// Check if we have an error.
		//
		if( meeting_ID.startsWith("Error ")) {
%>

Error: createMeeting() failed
<p /><%=meeting_ID%> 


<%
			return;
		}
		
		//
		// We've got a valid meeting_ID and password -- let's join!
		//

		String joinURL;
		if(request.getParameter("guest") != null)
			joinURL = getJoinMeetingURL(username, meeting_ID, password, true);
		else
			joinURL = getJoinMeetingURL(username, meeting_ID, password);			
%>

<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
</script>

<%
	} 
%>
 
</body>
</html>


