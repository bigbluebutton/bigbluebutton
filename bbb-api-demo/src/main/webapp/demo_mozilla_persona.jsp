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

Author: Marcos Calderon <mcmarkos86@gmail.com>

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
	<title>Join Demo Meeting using Mozilla Persona</title>
	<script src="https://login.persona.org/include.js" type="text/javascript"></script> 
	<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
</head>

<body>

<%@ include file="bbb_api.jsp"%>
<%@ page import="com.google.gson.Gson"%>
<%@ page import="com.google.gson.reflect.TypeToken"%>

<% 
if (request.getParameterMap().isEmpty()) {
	//
	// Assume we want to create a meeting
	//
	%> 
<%@ include file="demo_header.jsp"%>

<script type="text/javascript">
//browserid
$(function() {
  $('#browserid').click(function() {
    navigator.id.get(gotAssertion);
    return false;
  });
});

function gotAssertion(assertion) {
	if (assertion) {
		var assertion_field = document.getElementById("assertion-field");
		assertion_field.value = assertion;
		var login_form = document.getElementById("form1");
		login_form.submit();
	}
}

function loggedIn(res){
	alert(res.email);
}

</script>

<h2>Join Demo Meeting using BrowserID (<a href="http://mozilla.org/persona/">Mozilla Persona</a>)</h2>


<FORM id="form1" NAME="form1" METHOD="GET"> 
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
	<tbody>
		<tr>
			<td>
				&nbsp;</td>
			<td style="text-align: left ">
				<a href="#" id="browserid" title="Sign-in with BrowserID">
				  <img src="https://browserid.org/i/sign_in_blue.png" alt="Sign in">
				</a>
			</td>
		</tr>	
	</tbody>
</table>
<INPUT TYPE=hidden NAME=action VALUE="create">
<input type="hidden" name="assertion" id="assertion-field" /> 
</FORM>


<%
} else  if (request.getParameter("action").equals("create")) {
	
	//
	// Got an action=create
	//
	
	String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
	String joinURL = "";

	try{

		String data = URLEncoder.encode("assertion", "UTF-8") + "=" + URLEncoder.encode(request.getParameter("assertion"), "UTF-8");
		data += "&" + URLEncoder.encode("audience", "UTF-8") + "=" + URLEncoder.encode(BigBlueButtonURL.replace("/bigbluebutton/",""),"UTF-8");
		URL urlBrowserID = new URL("https://verifier.login.persona.org/verify");


		URLConnection conn = urlBrowserID.openConnection();
		((HttpURLConnection)conn).setRequestMethod("POST");
		conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        conn.setDoOutput(true);
        OutputStreamWriter wr = new OutputStreamWriter(conn.getOutputStream());
        wr.write(data);
        wr.flush();
 
        // Get the response
        BufferedReader rd = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        String jsonResp = "";
        String line;
        while ((line = rd.readLine()) != null) {
            jsonResp += line;
        }
        wr.close();
        rd.close();

        Gson gson = new Gson();
		HashMap<String,String> map = gson.fromJson(jsonResp, new TypeToken<Map<String, String>>() {}.getType());
		if(map.get("status").equalsIgnoreCase("okay")){
			joinURL = getJoinURL(map.get("email"), "Demo Meeting", "false", null, null, null);
		}
	}catch(Exception e){

	}

	// String preUploadPDF = "<?xml version='1.0' encoding='UTF-8'?><modules><module name='presentation'><document url='"+url+"pdfs/sample.pdf'/></module></modules>";
	

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


<%@ include file="demo_footer.jsp"%>

</body>
</html>
