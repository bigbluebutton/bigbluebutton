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
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js"></script>
	<script type="text/javascript" src="heartbeat.js"></script>
	<title>Recording Meeting Demo</title>
	<style type="text/css">
	 #formcreate{ 
	 	width:500px; 
	 	height:500px;
	 }
	 #formcreate ul{
	 	list-style:none;
	 }
	 #formcreate li{
	 	display:block;
	 	width:400px;
	 	margin-bottom:5px;
	 }
	 #formcreate label{
	 	display:block;
	 	float:left;
	 	width:150px;
	 	text-align:right;
	 }
	 .descript{
	 	vertical-align:top;
	 }
	</style>
</head>
<body>
<script>
$(document).ready(function(){
	isRunningMeeting();	// update the available meeting information as soon as the page is loaded.
});


public function onChange(){
	isRunningMeeting();
}

function isRunningMeeting(meetingID) {
	$.ajax({
    	type: "GET",
		url: 'demo10_helper.jsp?getxml=true',
		dataType: "text/xml",
		cache: false,
		success: function(xml) {
			response = $.xml2json(xml);
			if(response.running=="true"){
				$("liInputDescrip").hide();
				$("liInfoDescrip").show();
			}else{
				$("liInfoDescrip").hide();
				$("liInputDescrip").show();
			}
		},
		error: function() {
			$("#no_meetings").text("Failed to connect to API.");
			$("#meetings").text("");
		}
	});
}
</script>

<%@ include file="bbb_api.jsp"%>
<%@ page import="java.util.regex.*"%>

<%@ include file="demo_header.jsp"%>

<%
	if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to create a meeting
		//
%>
	<h2>Demo: Join a Recorded Class</h2>

	<form id="formcreate" name="formcreate" method="get" action=""> 
		<fieldset>
			<legend>Meeting Information</legend>
			<ul>
				<select name="meetingID" onchange="onChange();">
					<option value="English 232">English 232</option>
					<option value="English 300">English 300</option>
					<option value="English 402">English 402</option>
					<option value="Demo Meeting">Demo Meeting</option>
				</select>	
				<li id="liInputDescrip">
					<label class="descript" for="meta_description">Description:</label>
					<textarea id="meta_description" name="meta_description" cols="17" rows="3"></textarea>
				</li>
				<li id="liInfoDescrip">
					<label class="descript">Description:</label>
					<p>An active Meeting is already running</p>
				</li>
				<li>
					<label for="username1">Your Name:</label>
					<input id="username1" name="username1" type="text" />	
				</li>
			</ul>
		</fieldset>
		<input type="submit" value="Create" >
		<input type="hidden" name="action" value="create" />
	</form>

<%
	} else if (request.getParameter("action").equals("create")) {
		
		String meetingID=request.getParameter("meetingID");
		String username = request.getParameter("username1");
		
		//metadata
		Map<String,String> metadata=new HashMap<String,String>();
		
		metadata.put("description",request.getParameter("meta_description"));

		//
		// This is the URL for to join the meeting as moderator
		//
		String joinURL = getJoinURL(username, meetingID, "true", "Welcome to " + meetingID , metadata);
		if (joinURL.startsWith("http://")) {
%>
<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
</script>
<%
		}else{
%>
Error: getJoinURL() failed
<p /><%=joinURL%> <%
		}
	}
%> 

<%@ include file="demo_footer.jsp"%>

</body>
</html>
