<%@ page session="false" %>
<%@ page import="java.util.List,
                 java.util.Iterator,
                 org.blindsideproject.fileupload.SlideDescriptor" %>

<!-- imageList.jsp -->

<html>
<body>
This is jsp
<%
List slides = (List) request.getAttribute("slides");
if (slides != null) {
for (Iterator it = slides.iterator(); it.hasNext();) {
SlideDescriptor slide = (SlideDescriptor) it.next();
%>
<table border="1" cellspacing="0" cellpadding="5">
  <tr><td width="10%">Name</td><td><%= slide.getName() %>&nbsp;</td></tr>
	<tr><td colspan="2"><img src="display?name=<%= slide.getName() %>&room=<%= slide.getRoom() %>" height="100"></td></tr>
	<tr><td>Room (<%= slide.getRoom() %>)&nbsp;</td></tr>
</table>
<p>
<%
}
} else {
%>
There are no slides for the conference.
<%
}
%>

<p>
<table border="1" cellspacing="0" cellpadding="5">
<form action="fileUpload" method="post" encType="multipart/form-data">
  <tr><td width="10%">Conference Room:</td><td><input type="text" name="room"><br></td></tr>
  <tr><td>Presentation</td><td><input type="file" name="pres"><br></td></tr>
  <tr><td colspan="2"><input type="submit" value="Upload image"></td></tr>
</form>
</table>

<p><a href="clearDatabase">Clear database</a>

</body>
</html>
