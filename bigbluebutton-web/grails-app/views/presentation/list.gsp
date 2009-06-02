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

			<h1>File Upload:</h1><br>

			 <g:form method="post"  enctype="multipart/form-data">
	                <div class="dialog">
	                    <table>
	                        <tbody>
	                        	<tr class="prop">
	                                <td valign="top" class="name">
	                                    <label for="presentationName">Presentation Name:</label>
	                                </td>
	                                <td valign="top" class="name">
	                                    <input type="text" name="presentationName" value="${presentationName}" />
	                                </td>
	                            </tr> 
	                            <tr class="prop">
	                                <td valign="top" class="name">
	                                    <label for="fileUpload">Upload:</label>
	                                </td>
	                                <td valign="top" class="value ${hasErrors(presentations,field:'upload','errors')}">
	                                    <input type="file" id="fileUpload" name="fileUpload" />
	                                </td>
	                            </tr> 
	                        </tbody>
	                    </table>
	                </div>
	                <div class="buttons">
	                    <span class="button"><g:actionSubmit class="upload" value="Upload" action="upload" /></span>
	                </div>
	            </g:form>

            <h1>Presentations</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
			<div id="success"></div>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                            <g:sortableColumn property="files" title="file"/>
                            <g:sortableColumn property="path" title="path" colspan="3"/>
                       </tr>
                    </thead>
                    <tbody>
                    <g:each in="${presentations}" status="i" var="presentation">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                            <td>${presentation.decodeURL()}</td>
                            <td><g:link action="thumbnails" id="${presentation.replace('.','###')}"> thumbnails </g:link></td>
                            <td><g:link action="show" id="${presentation.replace('.','###')}"> show </g:link></td>
                            <td><g:link action="delete" id="${presentation.replace('.','###')}" onclick="return confirm('Are you sure?');"> delete </g:link></td>
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
        </div>
    </body>
</html>

