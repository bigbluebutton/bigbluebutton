

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
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'username')}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Conference Name:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:conference, field:'conferenceName')}</td>
                            
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
                             <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="schedules"></label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conferenceInstance,field:'schedules','errors')}">
                                    
<ul>
<g:each var="s" in="${conferenceInstance?.schedules?}">
    <li><g:link controller="schedule" action="show" id="${s.id}">${s?.encodeAsHTML()}</g:link></li>
</g:each>
</ul>
<g:link controller="schedule" params="['conferenceId':conference.id]" action="create">Add Schedule</g:link>

                                </td>
                            </tr> 
                                               
                        <tr class="prop">
                            <td valign="top" class="name">Schedules:</td>
                            
                            <td  valign="top" style="text-align:left;" class="value">
                                <ul>
                                <g:each var="s" in="${conference.schedules}">
                                    <li><g:link controller="schedule" action="show" id="${s.id}">${s?.encodeAsHTML()}</g:link></li>
                                </g:each>
                                </ul>
                            </td>
                            
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
    </body>
</html>
