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

<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
	pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Join a Course (Password Required)</title>
</head>
<body>

<%@ include file="bbb_api.jsp"%>

<br>

<% 

//
// We're going to define some sample courses (meetings) below.  This API exampe shows how you can create a login page for a course. 
// The password below are not available to users as they are compiled on the server.
//

HashMap<String, HashMap> allMeetings = new HashMap<String, HashMap>();
HashMap<String, String> meeting;

String welcome = "<br>Welcome to %%CONFNAME%%!<br><br>For help see our <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>tutorial videos</u></a>.<br><br>To join the voice bridge for this meeting:<br>  (1) click the headset icon in the upper-left, or<br>  (2) dial xxx-xxx-xxxx (toll free:1-xxx-xxx-xxxx) and enter conference ID: %%CONFNUM%%.<br><br>";


//
// English courses
//

meeting = new HashMap<String, String>();
allMeetings.put( "ENGL-2013: Research Methods in English", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"82013");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "ENGL-2213: Drama Production I", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"82213");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

meeting = new HashMap<String, String>();
allMeetings.put( "ENGL-2023: Survey of English Literature", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"82023");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

//
// Law Courses
//

meeting = new HashMap<String, String>();
allMeetings.put( "LAW-1323: Fundamentals of Advocacy ", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"81232");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

meeting = new HashMap<String, String>();
allMeetings.put( "LAW-2273: Business Organizations", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"82273");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

meeting = new HashMap<String, String>();
allMeetings.put( "LAW-3113: Corporate Finance", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"theprof");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"81642");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");


//
// Professor's Virtaul Office Hours
//

meeting = new HashMap<String, String>();
allMeetings.put( "Virtual Office Hours - Steve Stoyan", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"80001");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

meeting = new HashMap<String, String>();
allMeetings.put( "Virtual Office Hours - Michael Bailetti", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"80002");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");

meeting = new HashMap<String, String>();
allMeetings.put( "Virtual Office Hours - Tony Weiss", meeting );
	meeting.put("welcomeMsg", 	welcome);
	meeting.put("moderatorPW", 	"prof123");
	meeting.put("viewerPW", 	"student123");
	meeting.put("voiceBridge", 	"80003");
	meeting.put("logoutURL", 	"/bigbluebutton/demo/demo3.jsp");


meeting = null;

Iterator<String> meetingIterator = new TreeSet<String>(allMeetings.keySet()).iterator();

if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to join a course
		//
	%> 
<a href="demo1.jsp">Join a Course</a> | <a href="demo2.jsp">Join a Selected Course</a> | <a href="demo3.jsp">Join a Selected Course (password required)</a> | <a href="create.jsp">Create Your Own Meeting</a>

<h2>Demo #3: Join a Course (password required) a</h2>


<FORM NAME="form1" METHOD="GET">
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
	<tbody>
		<tr>
			<td>
				&nbsp;</td>
			<td style="text-align: right; ">
				Full&nbsp;Name:</td>
			<td style="width: 5px; ">
				&nbsp;</td>
			<td style="text-align: left ">
				<input type="text" name="username" /></td>
		</tr>
		
	
		
		<tr>
			<td>
				&nbsp;</td>
			<td style="text-align: right; ">
				Course:</td>
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
				Password:</td>
			<td>
				&nbsp;</td>
			<td>
				<input type="password" name="password" /></td>
		</tr>
		<tr>
			<td>
				&nbsp;</td>
			<td>
				&nbsp;</td>
			<td>
				&nbsp;</td>
			<td>
				<input type="submit" value="Join" /></td>
		</tr>	
	</tbody>
</table>
<INPUT TYPE=hidden NAME=action VALUE="create">
</FORM>

Passwords:  
<ul>
   <li>prof123 - login as professor (moderator privlidges)</li>
   <li>student123 - login as student (viewer privlidges)</li>
</ul>


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
		String meetingToken = createMeeting( meetingID, welcomeMsg, moderatorPW, viewerPW, voiceBridge, logoutURL );
		
		//
		// Check if we have an error.
		//
		if( meetingToken.startsWith("Error ")) {
%>

Error: createMeeting() failed
<p /><%=meetingToken%> 


<%
			return;
		}
		
		//
		// We've got a valid meetingToken and passoword -- let's join!
		//
		
		String joinURL = getJoinMeetingURL(username, meetingToken, password);			
%>

<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
</script>

<%
	} 
%>
 
<%@ include file="demo_footer.jsp"%>

</body>
</html>


