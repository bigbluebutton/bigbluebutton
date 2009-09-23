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
    <table>
      <tbody>
        <tr>
          <td>Voice Bridge Number:</td>
          <td>${voicebridge}</td>
        </tr>
        <tr>
          <td>Moderator Token</td>
          <td>${modToken}</td>
        </tr>
        <tr>
          <td>Viewer Token</td>
          <td>${viewerToken}</td>
        </tr>        
      </tbody>
    </table>
 	<form action="/bigbluebutton/api/conference/session.html" method="post">
    <table>
      <tbody>
        <tr>
          <td>Enter your name Fullname:</td>
          <td><input type="text" name="fullname" value="" /></td>
        </tr>
        <tr>
          <td>Enter Token:</td>
          <td><input type="text" name="authToken" value="" /></td>
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
