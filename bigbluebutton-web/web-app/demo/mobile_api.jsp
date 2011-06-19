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
<%@ include file="bbb_api.jsp"%>
<%@ include file="mobile_conf.jsp"%>

<%@page import="org.apache.commons.httpclient.HttpClient"%>
<%@page import="org.apache.commons.httpclient.HttpMethod"%>
<%@page import="org.apache.commons.httpclient.methods.GetMethod"%>

<%!
	private String getRequestURL(HttpServletRequest request) {
		//String requestURL = request.getRequestURL().toString().replace("http://127.0.0.1:8080/bigbluebutton/", BigBlueButtonURL);
		//if (!request.getQueryString().isEmpty());
		//	requestURL += "?" + request.getQueryString();
		//return requestURL;
		return request.getQueryString();
	}
	
	private String removeChecksum(String requestURL) {
		return requestURL.substring(0, requestURL.lastIndexOf("&checksum="));
	}
	
	private String addValidChecksum(String requestURL) {
		return requestURL + "&checksum=" + checksum(requestURL + mobileSalt);
	}
	
	private boolean checkTimestamp(HttpServletRequest request) {
    	String requestTimestamp = request.getParameter("timestamp");
    	if (requestTimestamp == null)
    		return false;
    		
		Long requestTimestampL = Long.valueOf(requestTimestamp);
		
		return (getTimestamp() - requestTimestampL <= 60);		
	}

	public boolean isRequestValid(HttpServletRequest request) {
		// if there's no checksum parameter, the request isn't valid
		if (request.getParameter("checksum") == null)
			return false;
			
		// check the timestamp for all the requests except getTimestamp
		if (!request.getParameter("action").equals("getTimestamp")
				&& !checkTimestamp(request))
			return false;
	
		String requestURL = getRequestURL(request);
		
		String urlWithoutChecksum = removeChecksum(requestURL);
		String urlWithChecksum = addValidChecksum(urlWithoutChecksum);
		return (requestURL.equals(urlWithChecksum));
	}
	
	public long getTimestamp() {
		return (System.currentTimeMillis() / 1000L);
	}
	
	public String mobileJoinMeeting(HttpServletRequest request) {
        String result = "<response><returncode>FAILED</returncode><message>Can't join the meeting</message></response>";
        
        if (!isRequestValid(request))
        	return result;
        	
        String meetingID = request.getParameter("meetingID");
        String fullName = request.getParameter("fullName");
        String password = request.getParameter("password");
        if (fullName == null || meetingID == null || password == null)
        	return result;
        
        String joinUrl = getJoinMeetingURL(fullName, meetingID, password);
        String enterUrl = BigBlueButtonURL + "api/enter";
        try {
            HttpClient client = new HttpClient();
            HttpMethod method = new GetMethod(joinUrl);
            client.executeMethod(method);
            method.releaseConnection();
            
            method = new GetMethod(enterUrl);
            client.executeMethod(method);
            result = method.getResponseBodyAsString();
            method.releaseConnection();
        } catch (Exception e) {
        }
        return result;
    }
	
	// it's just for testing purposes
	public String fixURL(HttpServletRequest request) {
		return addValidChecksum(removeChecksum(getRequestURL(request)));
	}
%>	
