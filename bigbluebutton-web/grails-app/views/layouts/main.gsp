<html>
    <head>
        <title><g:layoutTitle default="Grails" /></title>
        <link rel="stylesheet" href="${createLinkTo(dir:'css',file:'main.css')}" />
        <link rel="shortcut icon" href="${createLinkTo(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
        <g:layoutHead />
        <g:javascript library="application" />				
    </head>
    <body>
        <div id="spinner" class="spinner" style="display:none;">
            <img src="${createLinkTo(dir:'images',file:'spinner.gif')}" alt="Spinner" />
        </div>	
        <div class="logo"><img src="${createLinkTo(dir:'images',file:'bbb_banner.jpg')}" alt="BigBlueButton" /></div>	
        <div class="nav">
        	<div class="nav">
        		<g:render template="/adminmenubar" />
        </div>
        <h1>NOTE: We are deprecating this web interface in favor of the API. This will be removed in the next release.</h1>
        <g:layoutBody />	
        bbb-web v. <g:meta name="app.version"/>	
    </body>	
</html>
