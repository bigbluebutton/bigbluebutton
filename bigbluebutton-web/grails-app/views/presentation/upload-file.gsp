<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="layout" content="main" />
  <title>Upload Presentation</title>
</head>
<body>
  <g:if test="${flash.message}">
    <div class="message">${flash.message}</div>
  </g:if>
			 <g:form controller="presentation" method="post"  action="upload" enctype="multipart/form-data">
	                <div class="dialog">
	                    <table>
	                        <tbody>
	                        	<tr class="prop">
	                                <td valign="top" class="name">
	                                    <label for="presentationName">Presentation Name:</label>
	                                </td>
	                                <td valign="top" class="name">
	                                    <input type="text" name="presentation_name" value="${presentation_name}" />
	                                </td>
	                            </tr> 
	                            <tr class="prop">
	                                <td valign="top" class="name">
	                                    <label for="fileUpload">Upload:</label>
	                                </td>
	                                <td valign="top" class="name">
	                                    <input type="file" id="fileUpload" name="fileUpload" />
	                                </td>
	                            </tr> 
	                        </tbody>
	                    </table>
	                </div>
	                <div class="buttons">
	                    <!--span class="button"><g:actionSubmit class="upload" value="Upload" action="upload" /></span-->
	                    <input type="submit" value="Upload"/>
	                </div>
	            </g:form>
</body>
</html>
