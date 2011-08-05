<% 
/*
	BigBlueButton - http://www.bigbluebutton.org
	
	Copyright (c) 2011 by respective authors (see below). All rights reserved.
	
	BigBlueButton is free software; you can redistribute it and/or modify it under the 
	terms of the GNU Lesser General Public License as published by the Free Software 
	Foundation; either version 3 of the License, or (at your option) any later 
	version. 
	
	BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
	WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
	PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
	
	You should have received a copy of the GNU Lesser General Public License along 
	with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
	
	Author: Felipe Cecagno <fcecagno@gmail.com>
*/
%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<% 
	request.setCharacterEncoding("UTF-8"); 
	response.setCharacterEncoding("UTF-8"); 
%>

<%@page import="org.apache.commons.httpclient.HttpClient"%>
<%@page import="org.apache.commons.httpclient.HttpMethod"%>
<%@page import="org.apache.commons.httpclient.methods.GetMethod"%>

<%@ include file="mobile_api.jsp"%>

<%
    if (request.getParameterMap().isEmpty()) {
    } else if (request.getParameter("action").equals("getTimestamp")) {
    	String message = "<response><returncode>FAILED</returncode></response>";
    	
    	if (isRequestValid(request))
    		message = "<response><returncode>SUCCESS</returncode><timestamp>" + getTimestamp() + "</timestamp></response>";
%>
<%=message%>
<%
    } else if (request.getParameter("action").equals("getMeetings")) {
    	String meetings = "<meetings><meeting><returncode>FAILED</returncode></meeting></meetings>";
    	
    	if (isRequestValid(request))
    		meetings = getMeetings();
%>
<%=meetings%>
<%
    } else if (request.getParameter("action").equals("join")) {
        String result = mobileJoinMeeting(request);
%>
<%=result%>
<%
    } else if (request.getParameter("action").equals("create")) {
        String meetingID = request.getParameter("meetingID");
        String result = "<response><returncode>FAILED</returncode></response>";
        
        if (isRequestValid(request))
        	result = createMeeting(meetingID, "", "", "", 0, BigBlueButtonURL);
%>
<%=result%>
<%
    }
%>