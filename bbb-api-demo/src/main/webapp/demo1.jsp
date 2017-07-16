
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
	<title>Join Demo Meeting</title>
</head>

<body>

<%@ include file="bbb_api.jsp"%>

<%
if (request.getParameterMap().isEmpty()) {
	//
	// Assume we want to create a meeting
	//
	%>
/*<%@ include file="demo_header.jsp"%>*/

<h2>Join Demo Meeting</h2>


<FORM NAME="form1" METHOD="GET">
<table cellpadding="5" cellspacing="5" style="width: 400px; ">
	<tbody>
		<tr>
			<td>
				&nbsp;</td>
			<td style="text-align: right; ">
				Full Name:</td>
			<td style="width: 5px; ">
				&nbsp;</td>
			<td style="text-align: left ">
				<input type="text" autofocus required name="username" /></td>
		</tr>
		<tr>
			<td>
				&nbsp;</td>
			<td>
				&nbsp;</td>
			<td>
				&nbsp;</td>
			<td>
				<input type="submit" value="Join" /></td>
		</tr>
	</tbody>
</table>
<INPUT TYPE=hidden NAME=action VALUE="create">
</FORM>


<%
} else  if (request.getParameter("action").equals("create")) {

	//
	// Got an action=create
	//

	String username = request.getParameter("username");
	String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
	// String preUploadPDF = "<?xml version='1.0' encoding='UTF-8'?><modules><module name='presentation'><document url='"+url+"pdfs/sample.pdf'/></module></modules>";

	String joinURL = getJoinURL(request.getParameter("username"), "Demo Meeting", "false", null, null, null);

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
