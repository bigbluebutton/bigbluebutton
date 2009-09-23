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
  <form action="/bigbluebutton/api/conference.html" method="post">
    <table>
      <tbody>
        <tr>
          <td>Conference Number:</td>
          <td><input type="text" name="voiceBridge" value="85115" /></td>
        </tr>
        <tr>
          <td />
          <td><input type="submit" value="Create" /></td>
        </tr>
      </tbody>
    </table>
  </form>
</body>
</html>
