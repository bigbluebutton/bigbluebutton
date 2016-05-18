<html> 
 <head><title>Join & Upload Presentation (URL)</title></head></p> <p>
 <body>
 <%@ include file="bbb_api.jsp"%>  

<%
	String welcome = "<br>Welcome to <b>%%CONFNAME%%</b>!<br><br>To understand how BigBlueButton works see our <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>tutorial videos</u></a>.<br><br>To join the audio bridge click the headset icon (upper-left hand corner). <b>You can mute yourself in the Listeners window.</b>";

        if (request.getParameterMap().isEmpty()) {
		HashMap<String, String> presentations = new HashMap<String, String>();

		presentations.put( "BigBlueButton.pptx", "BigBlueButton.pptx" );
		presentations.put( "presentation1.pdf", "pdfs/presentation1.pdf" );
		presentations.put( "presentation2.pdf", "pdfs/presentation2.pdf" );
		presentations.put( "presentation3.pdf", "pdfs/presentation3.pdf" );
%>

<%@ include file="demo_header.jsp"%>

<h2>Join & Upload Presentation (URL)</h2> 
		<FORM NAME="form1" METHOD="GET">
			<table cellpadding="5" cellspacing="5" style="width: 400px;">
				<tbody>
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: right;">Full Name:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td style="text-align: left"><input type="text" autofocus required 
							name="username" />
						</td>
					</tr>
	
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: right">Preupload:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td><select name=presentationFileName>
                        <%
				Iterator<String> presentationsIterator = new TreeSet<String>(presentations.keySet()).iterator();
				String key;

                                while (presentationsIterator.hasNext()) {
                                        key = presentationsIterator.next();
                                        out.println("<option value=\"" + presentations.get(key) + "\">" + key + "</option>");
                                }

                        %>
						</select>
						</td>
					</tr>
	
					<tr>
						<td>&nbsp;</td>
						<td>&nbsp;</td>
						<td>&nbsp;</td>
						<td><input type="submit" value="Join" />
						</td>
					</tr>
				</tbody>
			</table>
			<INPUT TYPE=hidden NAME=action VALUE="create">
	</form>
 </body>
</html>

<%
} else if (request.getParameter("action").equals("create")) {
        
         // Got an action=create
  
        String username = request.getParameter("username");
        String presentationFileName = request.getParameter("presentationFileName");
	
	String demoURL = BigBlueButtonURL.replace("bigbluebutton/","demo/");
	String xml = "<?xml version='1.0' encoding='UTF-8'?> <modules>	<module name='presentation'> <document url='"+demoURL+presentationFileName+"' /> </module></modules>";
	String welcomeMsg = "The presentation will appear in moment.  To download click <a href=\"event:"+ demoURL+presentationFileName+ "\"><u>" + presentationFileName +"</u></a>.<br>" + welcome;

	String meetingID = presentationFileName.replace("pdfs/","").replace(".pdf","").replace(".pptx","");
	String joinURL = getJoinURL(username, meetingID, "false", welcomeMsg, null, xml );

	if (joinURL.startsWith("http://") || joinURL.startsWith("https://")) { 
		%>
		<script language="javascript" type="text/javascript">
		  window.location.href="<%=joinURL%>";
		</script>

		<%
		} else {
		%>

		Error: getJoinURL() failed
		<p />
		<%=joinURL %>
			<% 
				}
}
%>

<%@ include file="demo_footer.jsp"%>

</body>
</html>
