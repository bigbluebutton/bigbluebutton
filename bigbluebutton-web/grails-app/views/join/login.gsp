<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="layout" content="main" />
  <title>Login</title>
</head>
<body>
  <g:if test="${flash.message}">
    <div class="message">${flash.message}</div>
  </g:if>
  <g:form action="signIn">
    <table>
      <tbody>
        <tr>
          <td>Fullname:</td>
          <td><input type="text" name="fullname" value="${fullname}" /></td>
        </tr>
        <tr>
          <td>Conference:</td>
          <td><input type="conference" name="conference" value="${conference}" /></td>
        </tr>
		<tr>
          <td>Password:</td>
          <td><g:passwordField name="password" value="" /></td>
        </tr>
        <tr>
          <td />
          <td><input type="submit" value="Sign in" /></td>
        </tr>
      </tbody>
    </table>
  </g:form>
</body>
</html>
