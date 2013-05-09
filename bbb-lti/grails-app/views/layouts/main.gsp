<html>
    <head>
        <title><g:layoutTitle default="<g:message code="tool.view.title" />" /></title>
        <link rel="stylesheet" href="${resource(dir:'css',file:'main.css')}" />
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
        <g:layoutHead />
        <g:javascript library="application" />				
    </head>
    <body>
        <div id="spinner" class="spinner" style="display:none;">
            <img src="${resource(dir:'images',file:'spinner.gif')}" alt="Spinner" />
        </div>	
        <div class="logo"><img src="${resource(dir:'images',file:'bbb_logo.jpg')}" alt="BigBlueButton" /></div>
        <g:layoutBody />		
    </body>	
</html>