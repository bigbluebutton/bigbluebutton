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
<title>Insert title here</title>
</head>
<body>

<%@ include file="login.jsp" %>
<%@ include file="demo_header.jsp" %>

<br>

<hr />
<h2>Demo #3: Create a You Own Meeting</h2>
<hr />

<% 
if (request.getParameterMap().isEmpty()) {
	//
	// Assume we want to create a meeting
	//
	%>
	
<p/>

<FORM NAME="form1" METHOD="GET">
	
	<table width=600 cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border=3>
<tbody>
<tr>
<td width="50%">

Enter your name: <input type="text"
	name="name" /> <br />

<p/>
	
</td>
<td width="50%">

	<INPUT TYPE=hidden NAME=action VALUE="create">
	<br/>
	<input type="submit"
	value="Create" />
	</td>
</tr>
</tbody>
</table>

</FORM>


	<%
} else  if (request.getParameter("action").equals("create")) {
	//
	// Got an action=create
	//
	
	String name = request.getParameter("name");
	String meetingID = URLEncoder.encode(name+"'s meeting","UTF-8");
	
	String joinURL = getURL(name, meetingID);
	String inviteURL = BigBlueButtonURL+"demo/demo3.jsp?action=invite&meetingID="+meetingID;
	
	%>
	
	
	
		<table width="800" cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border=3>
<tbody>
<tr>
<td width="50%">
<center><strong>
<%=name %>'s meeting</strong> is now created.
</center>	
</td>

<td width="50%">

Click (or bookmark) the following link to join:
<p/>
<center>
<a href="<%=joinURL%>">Join</a>
</center>
<p/>&nbsp;<p/>
To invite others, send them the following link:


<form name="empty" method="POST">
<textarea cols="60" rows="5" name="myname" style="overflow:hidden">
<%=inviteURL%>
</textarea>
</form>
	</td>
</tr>
</tbody>
</table>






	
	<%
	
} else if (request.getParameter("action").equals("invite")) {
	String meetingID = request.getParameter("meetingID");
	%>
	



<FORM NAME="form1" METHOD="GET">
	
	<table width=600 cellspacing="20" cellpadding="20" style="border-collapse: collapse; border-right-color: rgb(136, 136, 136);" border=3>
<tbody>
<tr>
<td width="50%">

Enter your name: <input type="text"
	name="name" /> <br />
<INPUT TYPE=hidden NAME=meetingID VALUE="<%=meetingID %>">
<p/>

You are joining <strong><%=meetingID %></strong>.
	
</td>
<td width="50%">

	<INPUT TYPE=hidden NAME=action VALUE="join">
	<br/>
	<input type="submit"
	value="Join" />
	</td>
</tr>
</tbody>
</table>

</FORM>



		
	<%
} else if (request.getParameter("action").equals("join")) {
	//
	// We have a request to join an existing meeting
	//
	String name = request.getParameter("name");
	String meetingID = URLEncoder.encode(request.getParameter("meetingID"),"UTF-8");
	out.print( "name: #"+name+"# meetingID: #" + meetingID +"#" );
	 String joinURL = getURL(name, meetingID);
	// String joinURL = "xxx";
	%>
	
	<script language="javascript" type="text/javascript">
window.location.href="<%=joinURL%>";
</script>

	<% } %>
	
<%@ include file="demo_footer.jsp" %>

</body>
</html>