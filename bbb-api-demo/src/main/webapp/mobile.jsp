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
    String result = error(E_INVALID_URL);
    if (request.getParameterMap().isEmpty()) {
    	result = success("mobileSupported", "This server supports mobile devices.");
    } else if (request.getParameter("action") == null) {
        // return the default result
    } else if (request.getParameter("action").equals("getTimestamp")) {
    	result = getTimestamp(request);
    } else if (request.getParameter("action").equals("getMeetings")) {
    	result = mobileGetMeetings(request);
    } else if (request.getParameter("action").equals("join")) {
    	result = mobileJoinMeeting(request);
    } else if (request.getParameter("action").equals("create")) {
    	result = mobileCreate(request);
	}
%>
<%=result%>
