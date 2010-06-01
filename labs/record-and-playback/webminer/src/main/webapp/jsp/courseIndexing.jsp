
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1" %>
    <%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>


<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<link href="css/webminer.css" rel="stylesheet" type="text/css" />
<title>Indexing course</title>
</head>
<body>
<h1></h1>

<form:form action="courseIndexing.htm" method="post" commandName="sourceContentURL">

	<table>
		<tr>
			<td class="title">Create Search Index for archived sessions</td>
			
		</tr>
		<tr>
			<td colSpan="2" class="field_label">URL of Course Manifest: (e.g. the URL of lecture.xml)</td>
			
		</tr>
		<tr>
			<td class="user_input"><form:input size="100" path="lectureURL"/></td>
			<td><form:errors path="lectureURL" cssClass="error"/></td>
		</tr>
		<tr>
			<td colSpan="2" class="field_label">Base URL for Presentation Slides:</td>
		</tr>
		<tr>
			<td><form:input size="100" path="slideBaseURL"/></td>
			<td><form:errors path="slideBaseURL" cssClass="error"/></td>			
		</tr>
		<tr>
			<td colSpan="2" class="field_label">Indexing Summary:</td>
		</tr>
		<tr>
			<td><input type="text" size="100" name="summary"/></td>	
			<td><form:errors path="summary" cssClass="error"/></td>			
		</tr>
		<tr><td class="submit_button"><button type="submit">Start Indexing</button><br/></td></tr>
		<%
			String genErrorStr = (String) request.getAttribute("generalError");
		    if (genErrorStr != null){
		%>
		<tr>
			<td class="error"><%= genErrorStr%></td>
		</tr>
		<%
		    }
		%>
	</table>


</form:form>
</body>
</html>