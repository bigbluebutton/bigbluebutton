<html> 
 <head><title>Join & Upload Presentation</title></head></p> <p>
 <body>
 <%@ include file="bbb_api.jsp"%> 
 <%@ include file="demo_header.jsp"%>

<h2>Join & Upload Presentation</h2> 
	 <form action="demo7.jsp" method="post" enctype="multipart/form-data" name="form1" id="form1">
			<table cellpadding="5" cellspacing="5" style="width: 400px;">
				<tbody>
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: right;">Full&nbsp;Name:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td style="text-align: left"><input type="text" autofocus required 
							name="username" />
						</td>
					</tr>
	
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: left">Upload&nbsp;File:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td style="text-align: left"><input type="file"
							name="filename" /><!--  <input type="submit" / -->
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
  
    <%@ page import="java.util.List" %>
	<%@ page import="java.util.Iterator" %>
	<%@ page import="java.io.File" %>
	<%@ page import="org.apache.commons.fileupload.servlet.ServletFileUpload"%>
	<%@ page import="org.apache.commons.fileupload.disk.DiskFileItemFactory"%>
	<%@ page import="org.apache.commons.fileupload.*"%>
	<%@ page contentType="text/html;charset=UTF-8" language="java" %>
	<%@page import="sun.security.provider.SHA"%>
	<%@page import="org.apache.commons.codec.binary.Base64"%>
	<%@page import="java.security.MessageDigest"%>
 <%
     String uname="";	 
 boolean isMultipart = ServletFileUpload.isMultipartContent(request);
 
 if (!isMultipart) {
 } 
 else {
   FileItemFactory factory = new DiskFileItemFactory();
   ServletFileUpload upload = new ServletFileUpload(factory);
   List<FileItem> items = null;
   try {
	   items = upload.parseRequest(request);
   } catch (FileUploadException e) {
		e.printStackTrace();
   }
   out.print(items.size());
   Iterator<FileItem> itr = items.iterator();
   while (itr.hasNext()) {
	   FileItem item = (FileItem) itr.next();
		String xml = null;
 		// String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		// String preUploadPDF = "<?xml version='1.0' encoding='UTF-8'?><modules><module name='presentation'><document url='"+url+"pdfs/sample.pdf'/></module></modules>";
 
		// xml = preUploadPDF;
	   if (item.isFormField())
		   {
		      String name = item.getFieldName();
			  String value = item.getString();
			  if(name.equals("username"))
		           {
				   uname=value;
				   }
	   } else  { 
		try {
		
			String itemName = item.getName();
			 
			if(itemName!=""){
				byte[] b = item.get();
				String encoded = Base64.encodeBase64String(b); 
				xml = "<?xml version='1.0' encoding='UTF-8'?><modules><module name=\"presentation\"><document name=\""+itemName+"\">"+encoded+"\"</document></module></modules>";
			}
		} catch (Exception e) {
		   e.printStackTrace();
	    }

		 String welcome = "<br>Welcome to <b>%%CONFNAME%%</b>!<br><br>To understand how BigBlueButton works see our <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>tutorial videos</u></a>.<br><br>To join the audio bridge click the headset icon (upper-left hand corner). <b>You can mute yourself in the Listeners window.</b>";
		String welcomeMsg = "The uploaded presentation will appear in moment.<br>" + welcome;

		
		String joinURL = getJoinURLXML(uname, "Join and Upload example", welcomeMsg, xml );
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
   }
   }
   %>

<%@ include file="demo_footer.jsp"%>

</body>
</html>


