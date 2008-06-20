<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en">
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="spring" uri="/spring" %>
<%@ taglib prefix="spring-form" uri="/spring-form" %>
<head>
  <title><fmt:message key="title"/></title>
  <style>
    .error { color: red; }
  </style>  
</head>
<body>
<h1>Register Admin User</h1>
<form method="post" action="register.html">
  <table width="95%" bgcolor="f8f8ff" border="0" cellspacing="0" cellpadding="5">
    <tr>
      <td align="right" width="20%">Username:</td>
      <spring:bind path="userDetails.username">
        <td width="20%">
            <input name="username" value="<c:out value="${status.value}"/>">
        </td>
        <td width="60%">
            <font color="red"><c:out value="${status.errorMessage}"/></font>
        </td>
      </spring:bind>
    </tr>
    <tr>
      <td align="right" width="20%">Password:</td>
      <spring:bind path="userDetails.password">
        <td width="20%">
          <input name="password" value="<c:out value="${status.value}"/>">
        </td>
        <td width="60%">
          <font color="red"><c:out value="${status.errorMessage}"/></font>
        </td>
      </spring:bind>
    </tr>
  </table>
  <spring:hasBindErrors name="userDetails">
    <b>Please fix all errors!</b>
  </spring:hasBindErrors>  
  <br />
  <input type="submit" value="Execute">
</form>
</body>
</html>