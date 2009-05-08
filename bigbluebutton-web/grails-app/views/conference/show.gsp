

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Show Conference</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">Your Conferences</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New Conference</g:link></span>
            <span class="menuButton"><g:link controller="schedule" class="create" id="${conference?.id}" action="create">Schedule Session</g:link></span>
        </div>
        <div class="body">
            <h1>Show Conference</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="dialog">
                <table>
                    <tbody>

                        <tr class="prop">
                            <td valign="top" class="name">Created By:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'createdBy')}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Conference Name:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'name')}</td>
                            
                        </tr>
                        
                        <tr class="prop">
                            <td valign="top" class="name">Conference Number:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'conferenceNumber')}</td>
                            
                        </tr>
                                        
                        <tr class="prop">
                            <td valign="top" class="name">Date Created:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'dateCreated')}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Last Updated:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'lastUpdated')}</td>
                            
                        </tr>
                                                                   
                    </tbody>
                </table>
            </div>
            <div class="buttons">
                <g:form>
                    <input type="hidden" name="id" value="${conference?.id}" />
                    <span class="button"><g:actionSubmit class="edit" value="Edit" /></span>
                    <span class="button"><g:actionSubmit class="delete" onclick="return confirm('Are you sure?');" value="Delete" /></span>
                </g:form>
            </div>
        </div>
        <div class="body">
            <h1>Scheduled Sessions</h1>
            <div class="list">
                <table>
                    <thead>
                        <tr>                       
                   	        <g:sortableColumn property="name" title="Name" />                        
                   	        <g:sortableColumn property="tokenId" title="Link" />
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${sessions}" status="i" var="schedSession">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                            <td>${schedSession.name?.encodeAsHTML()}</td>
                        	<g:if test="${schedSession.expired}">
     							<td><g:link controller="schedule" action="show" id="${schedSession.id}">
                            			display</g:link>
                            	</td>
							</g:if>
                        	
                           
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
        </div>
    </body>
</html>
