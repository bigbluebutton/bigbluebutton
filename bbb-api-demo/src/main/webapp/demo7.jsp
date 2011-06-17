<html> 
 <head><title>Preupload Presentation</title></head></p> <p>
 <body>
 <%@ include file="bbb_api.jsp"%> 
 <%@ include file="demo_header.jsp"%>

<h2>Demo #7: Upload a presentation before joining a Course...</h2> 
	 <form action="demo7.jsp" method="post" enctype
		="multipart/form-data" name="form1" id="form1">
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
						<td style="text-align: left">Upload File:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td style="text-align: left"><input type="file"
							name="filename" /><!--  <input type="submit" />-->
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
		xml = "<?xml version='1.0' encoding='UTF-8'?> <modules>	<module name='presentation'>		<document url='http://www.samplepdf.com/sample.pdf' />	</module></modules>";
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
			 
			if(itemName==""){
				xml = "<?xml version='1.0' encoding='UTF-8'?> <modules>	<module name='presentation'>		<document url='http://www.samplepdf.com/sample.pdf' />	</module></modules>";
			}
			else {
				byte[] b = item.get();
				String encoded = Base64.encodeBase64String(b); 
				xml = "<?xml version='1.0' encoding='UTF-8'?> <modules>	<module name=\"presentation\">		<document name=\""+itemName+"\">"+encoded+"\"</document>	</module></modules>";
			}
		} catch (Exception e) {
		   e.printStackTrace();
	    }
		
		String joinURL = getJoinURLXML(uname, "Demo Meeting", "Presentation should be uploaded.  It was uploaded as an encoded file", xml );
		if (joinURL.startsWith("http://")) { 
			%>
			    <center><h1>Your presentation has been Uploaded</h1></center>
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
