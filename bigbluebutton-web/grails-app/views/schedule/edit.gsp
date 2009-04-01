

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Edit Schedule</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
        </div>
        <div class="body">
            <h1>Edit Schedule</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${scheduleInstance}">
            <div class="errors">
                <g:renderErrors bean="${scheduleInstance}" as="list" />
            </div>
            </g:hasErrors>
            <g:form method="post" >
                <input type="hidden" name="id" value="${scheduleInstance?.id}" />
                <div class="dialog">
                    <table>
                        <tbody>
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="scheduleName">Schedule Name:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'scheduleName','errors')}">
                                    <input type="text" id="scheduleName" name="scheduleName" value="${fieldValue(bean:scheduleInstance,field:'scheduleName')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="lengthOfConference">Length Of Conference:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'lengthOfConference','errors')}">
                                    <input type="text" id="lengthOfConference" name="lengthOfConference" value="${fieldValue(bean:scheduleInstance,field:'lengthOfConference')}" />
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="numberOfAttendees">Number Of Attendees:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'numberOfAttendees','errors')}">
                                    <input type="text" id="numberOfAttendees" name="numberOfAttendees" value="${fieldValue(bean:scheduleInstance,field:'numberOfAttendees')}" />
                                </td>
                            </tr> 
                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="record">Record:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'record','errors')}">
                                    <g:checkBox name="record" value="${scheduleInstance?.record}" ></g:checkBox>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="startDateTime">Start Date Time:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'startDateTime','errors')}">
                                    <g:datePicker name="startDateTime" value="${scheduleInstance?.startDateTime}" ></g:datePicker>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="scheduledBy">Scheduled By:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'scheduledBy','errors')}">
                                    ${scheduleInstance.scheduledBy}
                                </td>
                            </tr>                         
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><g:actionSubmit class="save" value="Update" /></span>
                    <span class="button"><g:actionSubmit class="delete" onclick="return confirm('Are you sure?');" value="Delete" /></span>
                	<span class="button"><g:link action="show" id="${scheduleInstance.id}">Cancel</g:link></span>
                </div>
            </g:form>
        </div>
    </body>
</html>
