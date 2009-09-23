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
  <form action="/bigbluebutton/api/conference/session.xml" method="post">
    <table>
      <tbody>
        <tr>
          <td>Fullname:</td>
          <td><input type="text" name="fullname" value="Richard" /></td>
        </tr>
        <tr>
          <td>Auth Token:</td>
          <td><input type="text" name="authToken" value="attToken" /></td>
        </tr>
        <tr>
          <td />
          <td><input type="submit" value="Join" /></td>
        </tr>
      </tbody>
    </table>
  </form>
</body>
</html>
