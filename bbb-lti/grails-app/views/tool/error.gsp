<%@ page contentType="text/html;charset=ISO-8859-1" %>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>
<meta name="layout" content="main"/>
<title>Insert title here</title>
</head>
<body>
  <div class="body">
<!-- tool.error  -->
  <g:if test="${ (resultMessageKey == 'InvalidEPortfolioUserId')}">
  ${resultMessage}
  </g:if>
  <g:else>
  Connection could not be established.
  </g:else>
  </div>
  <!-- {
            "error": {
                "messageKey": "${resultMessageKey}",
                "message": "${resultMessage}"
            }
        }
  -->
  <br/><br/>
</body>
</html>