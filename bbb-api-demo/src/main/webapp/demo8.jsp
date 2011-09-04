<html> 
 <head><title>Join & Upload Presentation (URL)</title></head></p> <p>
 <body>
 <%@ include file="bbb_api.jsp"%>  

<%
        if (request.getParameterMap().isEmpty()) {
                //
                // Assume we want to create a meeting
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
						<td style="text-align: left"><input type="text"
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
	String joinURL = getJoinURL(username, "Demo Meeting4", "false", 
 		"The presentation " + presentationFileName + " will appear in moment.  To download this presentation click <a href=\"event:"+ demoURL+presentationFileName+ "\"><u>here</u></a>", null, xml );

	if (joinURL.startsWith("http://")) { 
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
