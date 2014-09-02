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
	public final int E_OK = 0;
	public final int E_CHECKSUM_NOT_INFORMED = 1;
	public final int E_INVALID_CHECKSUM = 2;
	public final int E_INVALID_TIMESTAMP = 3;
	public final int E_EMPTY_SECURITY_KEY = 4;
	public final int E_MISSING_PARAM_MEETINGID = 5;
	public final int E_MISSING_PARAM_FULLNAME = 6;
	public final int E_MISSING_PARAM_PASSWORD = 7;
	public final int E_MISSING_PARAM_TIMESTAMP = 8;
	public final int E_INVALID_URL = 9;

    public String error(int code) {
        switch(code) {
            case E_CHECKSUM_NOT_INFORMED:
            case E_INVALID_CHECKSUM:
                return error("checksumError", "You did not pass the checksum security check.");
            case E_INVALID_TIMESTAMP:
                return error("invalidTimestamp", "You did not pass the timestamp check.");
            case E_EMPTY_SECURITY_KEY:
                return error("emptySecurityKey", "The mobile security key is empty. Please contact the administrator.");
            case E_MISSING_PARAM_MEETINGID:
                return error("missingParamMeetingID", "You must specify a meeting ID for the meeting.");
            case E_MISSING_PARAM_FULLNAME:
                return error("missingParamFullName", "You must specify a name for the attendee who will be joining the meeting.");
            case E_MISSING_PARAM_PASSWORD:
                return error("invalidPassword", "You either did not supply a password or the password supplied is neither the attendee or moderator password for this conference.");
            case E_MISSING_PARAM_TIMESTAMP:
                return error("missingParamTimestamp", "You must specify the timestamp provided by the server when you called the method getTimestamp.");
            case E_INVALID_URL:
                return error("invalidAction", "The requested URL is unavailable.");
            default:
                return error("unknownError", "An unexpected error occurred");
        }
    }
    
	private String getRequestURL(HttpServletRequest request) {
		return request.getQueryString();
	}
	
	private String removeChecksum(String requestURL) {
		return requestURL.substring(0, requestURL.lastIndexOf("&checksum="));
	}
	
	private String addValidChecksum(String requestURL) {
		return requestURL + "&checksum=" + checksum(requestURL + mobileSalt);
	}
	
	private int isRequestValid(HttpServletRequest request) {
		// if there's no checksum parameter, the request isn't valid
		if (request.getParameter("checksum") == null)
			return E_CHECKSUM_NOT_INFORMED;
		
		// check the timestamp for all the requests except getTimestamp
		if (!request.getParameter("action").equals("getTimestamp")) {
	    	String requestTimestamp = request.getParameter("timestamp");
	    	if (requestTimestamp == null)
	    		return E_MISSING_PARAM_TIMESTAMP;
			
			Long requestTimestampL = Long.valueOf(requestTimestamp);
			// the timestamp is valid for 60 seconds
			if (Math.abs(getTimestamp() - requestTimestampL) > 60)
				return E_INVALID_TIMESTAMP;
		}
		
		if (mobileSalt.isEmpty())
			return E_EMPTY_SECURITY_KEY;
		
		String requestURL = getRequestURL(request);
		String urlWithoutChecksum = removeChecksum(requestURL);
		String urlWithChecksum = addValidChecksum(urlWithoutChecksum);
		return (requestURL.equals(urlWithChecksum)? E_OK: E_INVALID_CHECKSUM);
	}
	
	private String mountResponse(String returncode, String messageKey, String message) {
	    return "<response><returncode>" + returncode + "</returncode><messageKey>" + messageKey + "</messageKey><message>" + message + "</message></response>";	
	}
	
	public String success(String messageKey, String message) {
		return mountResponse("SUCCESS", messageKey, message);
	}
	
	public String error(String messageKey, String message) {
		return mountResponse("FAILED", messageKey, message);
	}
	
	private long getTimestamp() {
		return (System.currentTimeMillis() / 1000L);
	}

	public String getTimestamp(HttpServletRequest request) {
		int code = isRequestValid(request);
    	if (code != E_OK)
			return error(code);

		return "<response><returncode>SUCCESS</returncode><timestamp>" + getTimestamp() + "</timestamp></response>";
	}
	
	public String mobileGetMeetings(HttpServletRequest request) {
		int code = isRequestValid(request);
    	if (code != E_OK)
			return error(code);
			
		return getMeetings();
	}
	
	public String mobileJoinMeeting(HttpServletRequest request) {
		int code = isRequestValid(request);
    	if (code != E_OK)
			return error(code);
        	
        String meetingID = request.getParameter("meetingID");
        if (meetingID == null) return error(E_MISSING_PARAM_MEETINGID);
        
        String fullName = request.getParameter("fullName");
        if (fullName == null) return error(E_MISSING_PARAM_FULLNAME);
        
        String password = request.getParameter("password");
        if (password == null) return error(E_MISSING_PARAM_PASSWORD);
        
        String result = error("failedJoin", "Couldn't join the meeting.");
        String joinUrl = getJoinMeetingURL(fullName, meetingID, password, null);
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
	
	public String mobileCreate(HttpServletRequest request) {
		int code = isRequestValid(request);
    	if (code != E_OK)
			return error(code);
			
        String meetingID = request.getParameter("meetingID");
        if (meetingID == null) return error(E_MISSING_PARAM_MEETINGID);
        
        return createMeeting(meetingID, "", "", "", "", 0, BigBlueButtonURL);
	}
	
	// it's just for testing purposes
	private String fixURL(HttpServletRequest request) {
		return addValidChecksum(removeChecksum(getRequestURL(request)));
	}
%>	
