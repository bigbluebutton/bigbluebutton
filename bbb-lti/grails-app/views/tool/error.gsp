<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>
    <title>Error</title>
    <asset:stylesheet src="bootstrap.css"/>
    <asset:stylesheet src="tool.css"/>
    <asset:javascript src="jquery.js"/>
    <asset:javascript src="bootstrap.js"/>
  </head>
  <body>
    <div class="body">
      <br/><br/>
      <div class="container">
      <g:if test="${ (resultMessageKey == 'InvalidEPortfolioUserId')}">
        <div class="alert alert-warning">
          ${resultMessage}
        </div>
      </g:if>
      <g:else>
        <div class="alert alert-danger">
          <g:message code="tool.error.general" />
        </div>
      </g:else>
      </div>
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