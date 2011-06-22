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
	<link rel="stylesheet" type="text/css" href="css/ui.jqgrid.css" />
	<link rel="stylesheet" type="text/css" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/themes/redmond/jquery-ui.css" />
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js"></script>
	<script src="js/jquery.jqGrid.min.js" type="text/javascript"></script>
	<script src="js/jquery.xml2json.js" type="text/javascript"></script>
	<title>Recording Meeting Demo</title>
	<style type="text/css">
	 #formcreate{
		margin-bottom:30px;
	 }
	 #formcreate label{
	 	display:block;
	 	float:left;
	 	width:100px;
	 	text-align:right;
		margin-right:5px;
	 }
	 #formcreate div{
		margin-bottom:5px;
	 }
	 #formcreate .submit{
		margin-left:100px;
		margin-top:15px;
	 }
	 .descript{
	 	vertical-align:top;
	 }
	 .ui-jqgrid{
		font-size:0.8em
	}
	</style>
</head>
<body>

<%@ include file="lib/bbb_api.jsp"%>
<%@ page import="java.util.regex.*"%>

<%@ include file="layout/demo_header.jsp"%>

<%
	if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to create a meeting
		//
%>
	<h2>Demo: Join a Recorded Class</h2>

	<form id="formcreate" name="formcreate" method="get" action=""> 		
		<div>
			<label for="meetingID">Meeting:</label>
			<select name="meetingID" onchange="onChangeMeeting(this.value);">
				<option value="English 232">English 232</option>
				<option value="English 300">English 300</option>
				<option value="English 402">English 402</option>
				<option value="Demo Meeting">Demo Meeting</option>
			</select>
		</div>
		<div>
			<label class="descript" for="meta_description">Description:</label>
			<textarea id="meta_description" name="meta_description" cols="17" rows="4"></textarea>
		</div>
		<div>
			<label for="username1">Your Name:</label>
			<input id="username1" name="username1" type="text" />	
		</div>	
		<input class="submit" type="submit" value="Join" >
		<input type="hidden" name="action" value="create" />
	</form>
	
	<h3>Recorded Sessions</h3>
	<select name="actions" onchange="recordedAction();">
		<option value="novalue" selected>Actions...</option>
		<option value="publish">Publish</option>
		<option value="unpublish">Unpublish</option>
		<option value="delete">Delete</option>
	</select>
	<table id="recordgrid"></table>
	<p>Note: New recordings will take a few minutes to appear list after session ends. Refresh your browser to update the above table.</p>
	<script>
	function onChangeMeeting(meetingID){
		isRunningMeeting(meetingID);
	}
	function isRunningMeeting(meetingID) {
		$.ajax({
			type: "GET",
			url: 'demo10_helper.jsp',
			data: "command=isRunning&meetingID="+meetingID,
			dataType: "xml",
			cache: false,
			success: function(xml) {
				response = $.xml2json(xml);
				if(response.running=="true"){
					$("#meta_description").val("An active session exists for "+meetingID+". This session is being recorded.");
					$("#meta_description").attr("readonly","readonly");
					$("#meta_description").attr("disabled","disabled");
				}else{
					$("#meta_description").val("");
					$("#meta_description").removeAttr("readonly");
					$("#meta_description").removeAttr("disabled");
				}
				
			},
			error: function() {
				alert("Failed to connect to API.");
			}
		});
	}
	$(document).ready(function(){
		$("#meetingID option[value='English 232']").attr("selected","selected");
		jQuery("#recordgrid").jqGrid({
			url: "demo10_helper.jsp?command=getRecords",
			datatype: "xml",
			height: 150,
			colNames:['Course','Description', 'Date Recorded', 'Published'],
			colModel:[
				{name:'course',index:'course', width:100, xmlmap: "metadata>meetingId"},
				{name:'description',index:'description', width:150, xmlmap: "startTime"},
				{name:'daterecorded',index:'daterecorded', width:300, xmlmap: "startTime"},
				{name:'published',index:'published', width:80, xmlmap: "published" }		
			],
			xmlReader: {
				root : "recordings",
				row: "recording",
				id: "id"
			},
			multiselect: true,
			caption: "Recorded Sessions"
		});
		
		//isRunningMeeting();	// update the available meeting information as soon as the page is loaded.
	});
	
	
	/*jQuery("#m1").click( function() {
		var s;
		s = jQuery("#recordgrid").jqGrid('getGridParam','selarrrow');
		for(var i=0;i<s.length;i++){
		var ret = jQuery("#recordgrid").jqGrid('getRowData',s[i]);
		alert("id="+ret.id+" invdate="+ret.invdate+"...");}
		alert("hola");
	});*/
	</script>
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

<%@ include file="layout/demo_footer.jsp"%>

</body>
</html>
