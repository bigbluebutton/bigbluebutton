<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>
    <title>Error</title>
    <asset:stylesheet src="bootstrap.css"/>
    <asset:stylesheet src="tool.css"/>
    <asset:javascript src="bootstrap.js"/>
</head>
  <body>
    <div class="body">
      <g:if test="${ (resultMessageKey == 'InvalidEPortfolioUserId')}">
        <div>${resultMessage}</div>
      </g:if>
      <g:else>
        <div>Connection could not be established.</div>
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