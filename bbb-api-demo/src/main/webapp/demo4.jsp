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
with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.

Author: Islam El-Ashi <ielashi@gmail.com>

-->

<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<% 
	request.setCharacterEncoding("UTF-8"); 
	response.setCharacterEncoding("UTF-8"); 
%>

<%@page import="org.w3c.dom.*"%>

<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Activity Monitor</title>
<link href="css/jquery-ui.css" rel="stylesheet" type="text/css"/>
<script type="text/javascript" src="js/demo4/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery-ui.min.js"></script>
<script type="text/javascript" src="js/demo4.js"></script>
<script type="text/javascript" src="js/md5.js"></script>
<script type="text/javascript" src="js/jquery.xml2json.js"></script>
<style type="text/css">
.hiddenDiv {display:none;}
.hor-minimalist-b{font-family:"Lucida Sans Unicode", "Lucida Grande", Sans-Serif;font-size:12px;background:#fff;width:480px;border-collapse:collapse;text-align:left;margin:20px;}.hor-minimalist-b th{font-size:14px;font-weight:normal;color:#039;border-bottom:2px solid #6678b1;padding:10px 8px;}.hor-minimalist-b td{border-bottom:1px solid #ccc;color:#669;padding:6px 8px;width:100px;}.hor-minimalist-b tbody tr:hover td{color:#009;}</style>
</head>
<body>

<%@ include file="bbb_api.jsp"%>

<%@ include file="demo_header.jsp"%>


<%
if (request.getParameterMap().isEmpty()) {
%>

<h2>Activity Monitor</h2>

<p id="no_meetings"></p>

<div id="meetings"></div>


<% 
} else if (request.getParameter("action").equals("end")) {
	 
	String mp = request.getParameter("moderatorPW");
	String meetingID = request.getParameter("meetingID");
	
	String result = endMeeting(meetingID, mp);
	
	if ( result.equals("true") ){

%>

<h2>Activity Monitor</h2>

<%=meetingID%> has been terminated.

<p id="no_meetings"></p>

<div id="meetings"></div>

<% } else { %>

<h2>Activity Monitor</h2>


Unable to end meeting: <%=meetingID%>

<%=result%>




<% 		}
	}%>
	
 <%@ include file="demo_footer.jsp"%>
</body>
</html>

 

