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
	<title>Join a Course</title>
</head>
<body>

<%@ include file="bbb_api.jsp"%>

<br>

<% 
if (request.getParameterMap().isEmpty()) {
	//
	// Assume we want to create a meeting
	//
	%> 
<a href="demo1.jsp">Join a Course</a> | <a href="demo2.jsp">Join a Selected Course</a> | <a href="demo3.jsp">Join a Selected Course (password required)</a> | <a href="create.jsp">Create Your Own Meeting</a>

<h2>Demo #1: Join a Course</h2>


<FORM NAME="form1" METHOD="GET"> 
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
	<tbody>
		<tr>
			<td>
				&nbsp;</td>
			<td style="text-align: right; ">
				Full Name:</td>
			<td style="width: 5px; ">
				&nbsp;</td>
			<td style="text-align: left ">
				<input type="text" name="username" /></td>
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


<%
} else  if (request.getParameter("action").equals("create")) {
	
	//
	// Got an action=create
	//
	
	//
    // Request a URL to join a meeting called "Demo Meeting"
    // Pass null for welcome message to use the default message (see defaultWelcomeMessage in bigbluebutton.properties)
    //
	String joinURL = getJoinURL(request.getParameter("username"), "Demo Meeting", null );

	if (joinURL.startsWith("http://")) { 
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


<%@ include file="demo_footer.jsp"%>

</body>
</html>
