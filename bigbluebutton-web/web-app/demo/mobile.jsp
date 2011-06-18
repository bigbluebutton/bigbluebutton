<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<% 
	request.setCharacterEncoding("UTF-8"); 
	response.setCharacterEncoding("UTF-8"); 
%>

<%@page import="org.apache.commons.httpclient.HttpClient"%>
<%@page import="org.apache.commons.httpclient.HttpMethod"%>
<%@page import="org.apache.commons.httpclient.methods.GetMethod"%>

<%@ include file="bbb_api.jsp"%>
<%@ include file="mobile_conf.jsp"%>

<%!
public boolean isRequestValid() {
	try {
		String requestURL = request.getRequestURL().toString().replace("http://127.0.0.1:8080/", BigBlueButtonURL);
		if (!request.getQueryString().isEmpty());
			requestURL += "?" + request.getQueryString();
		
		String urlWithoutChecksum = requestURL.substring(0, requestURL.lastIndexOf("&checksum="));
		String urlWithChecksum = urlWithoutChecksum + "&checksum=" + checksum(urlWithoutChecksum + mobileSalt);
		
		return (requestURL.equals(urlWithChecksum));
	} catch(Exception e) {
		return false;
	}
}
%>

<%
    if (request.getParameterMap().isEmpty()) {
    } else if (request.getParameter("action").equals("getMeetings")) {
    	String meetings;
    	
    	//if (isRequestValid())
    		//meetings = getMeetings();
    	// checksum = 9a7e214fb21c2f568f68ed352c825588de7487a4
%>
<%=meetings%>

<%
    } else if (request.getParameter("action").equals("join")) {
        String meetingID = request.getParameter("meetingID");
        String fullName = request.getParameter("fullName");
        String password = request.getParameter("password");
        String joinUrl = getJoinMeetingURL(fullName, meetingID, password);
        String enterUrl = BigBlueButtonURL + "api/enter";
        String result = "<response><returncode>FAILED</returncode><message>Can't join the meeting</message></response>";
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
%>
<%=result%>
<%
    } else if (request.getParameter("action").equals("create")) {
        String meetingID = request.getParameter("meetingID");
        String result = createMeeting(meetingID, "", "", "", 0, BigBlueButtonURL);
%>
<%=result%>
<%
    }
%>