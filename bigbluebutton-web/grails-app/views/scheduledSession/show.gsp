
<%@ page import="org.bigbluebutton.web.domain.ScheduledSession" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Show ScheduledSession</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">ScheduledSession List</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New ScheduledSession</g:link></span>
        </div>
        <div class="body">
            <h1>Show ScheduledSession</h1>
            <g:if test="${flash.message}">
            	<div class="message">${flash.message}</div>
            </g:if>
            <div class="dialog">
                <table>
                    <tbody>
                        <tr class="prop">
                            <td valign="top" class="name">Name:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'name')}</td>                            
                        </tr>
                    
                    	<tr class="prop">
                            <td valign="top" class="name">Description:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'description')}</td>                            
                        </tr>
                        
                    	<tr class="prop">
                            <td valign="top" class="name">Voice Conference Bridge:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'voiceConferenceBridge')}</td>                            
                        </tr>
                       
                        <tr class="prop">
                            <td valign="top" class="name">Link:</td>                            
                            <td valign="top" class="value">
                            	${hostUrl}/bigbluebutton/conference-session (<a href="${hostUrl}/bigbluebutton/conference-session">JOIN</a>)
							</td>                            
                        </tr>

                        <tr class="prop">
                            <td valign="top" class="name">Number Of Attendees:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'numberOfAttendees')}</td>                            
                        </tr>

                        <tr class="prop">
                            <td valign="top" class="name">Conference:</td>                            
                            <td valign="top" class="value">
                            	<g:link controller="conference" action="show" id="${scheduledSessionInstance?.conference?.id}">
                            		${scheduledSessionInstance?.conference?.encodeAsHTML()}
                            	</g:link>
                            </td>                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Password Protect:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'passwordProtect')}</td>                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Host Password:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'hostPassword')}</td>                            
                        </tr>

                        <tr class="prop">
                            <td valign="top" class="name">Moderator Password:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'moderatorPassword')}</td>                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Attendee Password:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'attendeePassword')}</td>                            
                        </tr>

                        <tr class="prop">
                            <td valign="top" class="name">Record:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'record')}</td>                            
                        </tr>
                                        
                        <tr class="prop">
                            <td valign="top" class="name">Time Limited:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'timeLimited')}</td>                            
                        </tr>

                        <tr class="prop">
                            <td valign="top" class="name">Start Date Time:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'startDateTime')}</td>                            
                        </tr>                    
                    
                        <tr class="prop">
                            <td valign="top" class="name">End Date Time:</td>                           
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'endDateTime')}</td>                            
                        </tr>
                                        
                        <tr class="prop">
                            <td valign="top" class="name">Created By:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'createdBy')}</td>                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Date Created:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'dateCreated')}</td>                            
                        </tr>
                                        
                        <tr class="prop">
                            <td valign="top" class="name">Last Updated:</td>        
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'lastUpdated')}</td>                            
                        </tr>                    
                    
                        <tr class="prop">
                            <td valign="top" class="name">Modified By:</td>                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'modifiedBy')}</td>                            
                        </tr>
                    
                    </tbody>
                </table>
            </div>
            <div class="buttons">
                <g:form>
                    <input type="hidden" name="id" value="${scheduledSessionInstance?.id}" />
                    <span class="button"><g:actionSubmit class="edit" value="Edit" /></span>
                    <span class="button"><g:actionSubmit class="delete" onclick="return confirm('Are you sure?');" value="Delete" /></span>
                </g:form>
            </div>
        </div>
    </body>
</html>
