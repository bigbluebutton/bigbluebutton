<html> 
 <head><title>Join & Upload Presentation (URL)</title></head></p> <p>
 <body>
 <%@ include file="bbb_api.jsp"%>  
 <%@ include file="demo_header.jsp"%>
<%
String demoURL = BigBlueButtonURL.replace("/bigbluebutton",":8080/demo");
String name0="BigBlueButton.pptx";
String name1="pdfs/Demo123.pdf";
String name2="pdfs/Demo456.pdf";
String name3="pdfs/Demo789.pdf";
%>

<h2>Join & Upload Presentation (URL)</h2> 
	 <form action="demo8.jsp" method="post" enctype
		="multipart/form-data" name="form1" id="form1">
			<table cellpadding="5" cellspacing="5" style="width: 400px;">
				<tbody>
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: right;">Full Name::</td>
						<td style="width: 5px;">&nbsp;</td>
						<td style="text-align: left"><input type="text"
							name="username" />
						</td>
					</tr>
	
					<tr>
						<td>&nbsp;</td>
						<td style="text-align: right">Preupload:</td>
						<td style="width: 5px;">&nbsp;</td>
						<td><select name=filename>
							<option value=<%=name0%>><%=name0%></option>
							<option value=<%=name1%>><%=name1%></option>
							<option value=<%=name2%>><%=name2%></option>
							<option value=<%=name3%>><%=name3%></option>
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
 String fname="";
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
   Iterator<FileItem> itr = items.iterator();
   String xml = null;
   while (itr.hasNext()) {
	   FileItem item = (FileItem) itr.next();
		String name = item.getFieldName();
		String value = item.getString();
		if(name.equals("username"))	{
			uname=value;
		}
		if(name.equals("filename"))	{
			fname=value;
		}
	}
	xml = "<?xml version='1.0' encoding='UTF-8'?> <modules>	<module name='presentation'>		<document url='"+demoURL+fname+"' />	</module></modules>";
	String joinURL = getJoinURL(uname, "Demo Meeting2", "false", "Presentation URL should be passed::" + xml + "##", null, xml );
	if (joinURL.startsWith("http://")) { 
		%>
		    <center><h1>Your presentation URL has been passed</h1></center>
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
