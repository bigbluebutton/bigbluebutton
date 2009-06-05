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
  <g:if test="${info}">
    <table>
      <tbody>
        <tr>
          <td>Conference Name:</td>
          <td>${info.name}</td>
        </tr>
	    <tr>
	       <td>Conference Number:</td>
	    <td>${id}</td>
	    </tr>
		<tr>
          <td>Description:</td>
          <td>${info.description}</td>
        </tr>
      </tbody>
    </table>
  </g:if>
  <g:form controller="conference-session" action="signIn">
  	<g:if test="${id}">
  		<input type="hidden" name="id" value="${id}" />
  	</g:if>
    <table>
      <tbody>
        <tr>
          <td>Fullname:</td>
          <td><input type="text" name="fullname" value="${fullname}" /></td>
        </tr>
        <g:if test="${!id}">
	        <tr>
	          <td>Conference Number:</td>
	          <td><input type="text" name="id" value="${id}" /></td>
	        </tr>
        </g:if>
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
