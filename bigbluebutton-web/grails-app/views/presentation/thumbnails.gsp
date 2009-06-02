<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>FileResource List</title>
    </head>
    <body>
        <div class="nav">
   			  <span class="menuButton"><a class="home" href="/">Home</a></span>
     </div>
        <div class="body">

			<h1>${numThumbs} </h1><br>re ${presSlides}
			<g:each var="x" in="${ (0..<numThumbs) }">
    			<li><g:createLink action="show" params="[foo: 'bar', boo: 'far']"/>
    				<img src="${createLink(action:'thumbnail', params:[id:presSlides, thumb:x])}" alt="BigBlueButton" />
    				<g:link action="thumbnail" id="${presSlides}" params="[thumb:x]">t</g:link>
    			</li>
  			</g:each>
			
        </div>
    </body>
</html>

