
<%@ page import="org.bigbluebutton.web.domain.ScheduledSession" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Edit ScheduledSession</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">ScheduledSession List</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New ScheduledSession</g:link></span>
        </div>
        <div class="body">
            <h1>Edit ScheduledSession</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${scheduledSessionInstance}">
            <div class="errors">
                <g:renderErrors bean="${scheduledSessionInstance}" as="list" />
            </div>
            </g:hasErrors>
            <g:form method="post" >
                <input type="hidden" name="id" value="${scheduledSessionInstance?.id}" />
                <div class="dialog">
                    <table>
                        <tbody>
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="name">Name:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'name','errors')}">
                                    <input type="text" id="name" name="name" value="${fieldValue(bean:scheduledSessionInstance,field:'name')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="numberOfAttendees">Number Of Attendees:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'numberOfAttendees','errors')}">
                                    <input type="text" id="numberOfAttendees" name="numberOfAttendees" value="${fieldValue(bean:scheduledSessionInstance,field:'numberOfAttendees')}" />
                                </td>
                            </tr> 

                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="record">Record:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'record','errors')}">
                                    <g:checkBox name="record" value="${scheduledSessionInstance?.record}" ></g:checkBox>
                                </td>
                            </tr> 
                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="timeLimited">Time Limited:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'timeLimited','errors')}">
                                    <g:checkBox name="timeLimited" value="${scheduledSessionInstance?.timeLimited}" ></g:checkBox>
                                </td>
                            </tr> 
                            
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="startDateTime">Start Date Time:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'startDateTime','errors')}">
                                    <g:datePicker name="startDateTime" value="${scheduledSessionInstance?.startDateTime}" ></g:datePicker>
                                </td>
                            </tr>                         

                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="startDateTime">End Date Time:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'endDateTime','errors')}">
                                    <g:datePicker name="endDateTime" value="${scheduledSessionInstance?.endDateTime}" ></g:datePicker>
                                </td>
                            </tr> 
                                                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="passwordProtect">Password Protect:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'passwordProtect','errors')}">
                                    <g:checkBox name="passwordProtect" value="${scheduledSessionInstance?.passwordProtect}" ></g:checkBox>
                                </td>
                            </tr> 
                                                    
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="attendeePassword">Attendee Password:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'attendeePassword','errors')}">
                                    <input type="text" id="attendeePassword" name="attendeePassword" value="${fieldValue(bean:scheduledSessionInstance,field:'attendeePassword')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="hostPassword">Host Password:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'hostPassword','errors')}">
                                    <input type="text" id="hostPassword" name="hostPassword" value="${fieldValue(bean:scheduledSessionInstance,field:'hostPassword')}"/>
                                </td>
                            </tr> 

                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="moderatorPassword">Moderator Password:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'moderatorPassword','errors')}">
                                    <input type="text" id="moderatorPassword" name="moderatorPassword" value="${fieldValue(bean:scheduledSessionInstance,field:'moderatorPassword')}"/>
                                </td>
                            </tr> 
                                                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="conference">Conference:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'conference','errors')}">
                                    ${scheduledSessionInstance?.conference?.name}
                                </td>
                            </tr> 
                                                                            
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="createdBy">Created By:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'createdBy','errors')}">
                                    ${fieldValue(bean:scheduledSessionInstance,field:'createdBy')}
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="dateCreated">Date Created:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'dateCreated','errors')}">
                                    ${scheduledSessionInstance?.dateCreated}
                                </td>
                            </tr> 

                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="lastUpdated">Last Updated:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'lastUpdated','errors')}">
                                    ${scheduledSessionInstance?.lastUpdated}
                                </td>
                            </tr> 
                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="modifiedBy">Modified By:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduledSessionInstance,field:'modifiedBy','errors')}">
                                    ${fieldValue(bean:scheduledSessionInstance,field:'modifiedBy')}
                                </td>
                            </tr> 

                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><g:actionSubmit class="save" value="Update" /></span>
                    <span class="button"><g:actionSubmit class="delete" onclick="return confirm('Are you sure?');" value="Delete" /></span>
                </div>
            </g:form>
        </div>
    </body>
</html>
