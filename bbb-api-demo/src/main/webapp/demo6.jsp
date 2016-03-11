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
	<title>Record (Matterhorn)</title>
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
	 #labdescription{
	 	vertical-align:top;
	 }
	</style>
</head>
<body>


<%@ include file="bbb_api.jsp"%>
<%@ include file="demo_header.jsp"%>

<%
	if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to create a meeting
		//
%>
	<h2>Record (Matterhorn)</h2>

	<form id="formcreate" name="formcreate" method="get" action=""> 
		<fieldset>
			<legend>Meeting Information</legend>
			<ul>
				<li>
					<label for="confname">Meeting Name:</label>
					<input id="confname" autofocus required name="confname" type="text" />
				</li>
				<li>
					<label for="username1">Your Name:</label>
					<input id="username1" required name="username1" type="text" />	
				</li>
			</ul>
		</fieldset>
		<fieldset>
			<legend>Metadata Details</legend>
			<ul>
				<li>
					<label for="meta_title">Title:</label>
					<input type="text" id="meta_title" name="meta_title" />	
				</li>
				<li>
					<label for="meta_subject">Subject:</label>
					<input type="text" id="meta_subject" name="meta_subject" />
				</li>
				<li>
					<label id="labdescription" for="meta_description">Description:</label>
					<textarea id="meta_description" name="meta_description" cols="17" rows="3"></textarea>
				</li>
				<li>
					<label for="meta_creator">Creator:</label>
					<input type="text" id="meta_creator" name="meta_creator" />
				</li>
				<li>
					<label for="meta_contributor">Contributor:</label>
					<input type="text" id="meta_contributor" name="meta_contributor" />
				</li>
				<li>
					<label for="meta_language">Language:</label>
					<input type="text" id="meta_language" name="meta_language" />
				</li>
				<li>
					<label for="meta_identifier">Identifier:</label>
					<input type="text" id="meta_identifier" name="meta_identifier" />
				</li>	
			</ul>
		</fieldset>
		<input type="submit" value="Create" >
		<input type="hidden" name="action" value="create" />
	</form>

<%
	} else if (request.getParameter("action").equals("create")) {
		
		String confname = request.getParameter("confname");
		String username = request.getParameter("username1");
		
		//metadata
		Map<String,String> metadata=new HashMap<String,String>();
		
		metadata.put("title",request.getParameter("meta_title"));
		metadata.put("subject",request.getParameter("meta_subject"));
		metadata.put("description",request.getParameter("meta_description"));
		metadata.put("creator",request.getParameter("meta_creator"));
		metadata.put("contributor",request.getParameter("meta_contributor"));
		metadata.put("language",request.getParameter("meta_language"));
		metadata.put("identifier",request.getParameter("meta_identifier"));

		//
		// This is the URL for to join the meeting as moderator
		//
		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String preUploadPDF = "<?xml version='1.0' encoding='UTF-8'?><modules><module name='presentation'><document url='"+url+"pdfs/matterhorn.pdf'/></module></modules>";
		String joinURL = getJoinURL(username, confname, "true", null, metadata, preUploadPDF);

		if (joinURL.startsWith("http://") || joinURL.startsWith("https://")) { 
%>

<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
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

<p>
See: <a href="http://code.google.com/p/bigbluebutton/wiki/MatterhornIntegration">Matterhorn Integration</a>

<%@ include file="demo_footer.jsp"%>

</body>
</html>
