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

Author: Jesus Federico <jesus@123it.ca>

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
<title>Join Demo Meeting using OpenID</title>
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript">
    $(function() {
        var form = $('#form1');
        $('#google').click(function() {
            $("<input>").attr({
                'type':'hidden',
                'name':'connect',
                'value':'google'
            }).appendTo(form);
            $('#form1').submit();
               return false;
            });
        $('#yahoo').click(function() {
            $("<input>").attr({
                'type':'hidden',
                'name':'connect',
                'value':'yahoo'
            }).appendTo(form);
            $('#form1').submit();
               return false;
            });
        $('#custom').click(function() {
            $("<input>").attr({
                'type':'hidden',
                'name':'connect',
                'value':'custom'
            }).appendTo(form);
            $('#form1').submit();
               return false;
            });
        });
</script>
</head>
<body>

<%@ include file="bbb_api.jsp"%>
<%@ include file="bbb_jopenid.jsp"%>

<% 
String urlPath = request.getRequestURI();
String urlHost = new URL(BigBlueButtonURL).getProtocol() + "://" + new URL(BigBlueButtonURL).getAuthority();
    
if (request.getParameterMap().isEmpty()) {
	//
	// Assume we want to create a meeting
	//
%> 
<%@ include file="demo_header.jsp"%>

<h2>Join Demo Meeting using openID</h2>

<FORM id="form1" NAME="form1" METHOD="GET" ACTION="#"> 
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
    <tbody>
        <tr>
            <td>&nbsp;</td>
            <td style="text-align: left ">
                <a href="#" id="google" title="Sign-in with Google OpenID">
                    <img src="images/google.png" alt="Sign in"></br>
                </a>
            </td>
        </tr>   
        <tr>
            <td>&nbsp;</td>
            <td style="text-align: left ">
                <a href="#" id="yahoo" title="Sign-in with Yahoo OpenID">
                    <img src="images/yahoo.png" alt="Sign in"></br>
                </a>
            </td>
        </tr>   
        <!--
        <tr>
            <td>&nbsp;</td>
            <td style="text-align: left ">
                <a href="#" id="custom" title="Sign-in with Custom OpenID">
                    <img src="images/openid.png" alt="Sign in"></br>
                </a>
            </td>
        </tr>
        -->   
    </tbody>
</table>
</FORM>

<%
} else if (request.getParameter("connect")!=null ) {
    manager.setRealm(urlHost);
    manager.setReturnTo(urlHost + urlPath);
    Endpoint endpoint = null;
    
    if (request.getParameter("connect").equals("google")) {
		endpoint = manager.lookupEndpoint("Google");
            
	} else if (request.getParameter("connect").equals("yahoo")) {
        endpoint = manager.lookupEndpoint("Yahoo");

	} else if (request.getParameter("connect").equals("custom")) {
        endpoint = manager.lookupEndpoint("Google");
        //endpoint = manager.lookupEndpoint("Custom");
	    	    
	}

    Association association = manager.lookupAssociation(endpoint);
    request.getSession().setAttribute(ATTR_MAC, association.getRawMacKey());
    request.getSession().setAttribute(ATTR_ALIAS, endpoint.getAlias());
    String url = manager.getAuthenticationUrl(endpoint, association);
    response.sendRedirect(url);

} else if (request.getParameter("openid.ns")!=null && !request.getParameter("openid.ns").equals("")) {

    byte[] mac_key = (byte[]) request.getSession().getAttribute(ATTR_MAC);
    String alias = (String) request.getSession().getAttribute(ATTR_ALIAS);
    Authentication authentication = manager.getAuthentication(request, mac_key, alias);
	String joinURL = getJoinURL(authentication.getFullname(), "Demo Meeting", null, null, null, null );

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
