

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Create Schedule</title>         
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
        </div>
        <div class="body">
            <h1>Create Schedule</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${scheduleInstance}">
            <div class="errors">
                <g:renderErrors bean="${scheduleInstance}" as="list" />
            </div>
            </g:hasErrors>
            <g:form action="save" method="post" >
            	<input type="hidden" name="conferenceId" value="${conferenceId}" />
                <div class="dialog">
                    <table>
                        <tbody>
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="scheduleName">Name this schedule:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'scheduleName','errors')}">
                                    <input type="text" id="scheduleName" name="scheduleName" value="${fieldValue(bean:scheduleInstance,field:'scheduleName')}"/>
                                </td>
                            </tr> 
                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="lengthOfConference">How long (hours)?:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'lengthOfConference','errors')}">
                                    <input type="text" id="lengthOfConference" name="lengthOfConference" value="${fieldValue(bean:scheduleInstance,field:'lengthOfConference')}" />
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="numberOfAttendees">How many will attend?:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'numberOfAttendees','errors')}">
                                    <input type="text" id="numberOfAttendees" name="numberOfAttendees" value="${fieldValue(bean:scheduleInstance,field:'numberOfAttendees')}" />
                                </td>
                            </tr> 

                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="hostPassword">Password for Host?:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'hostPassword','errors')}">
                                    <input type="text" id="hostPassword" name="hostPassword" value="${fieldValue(bean:scheduleInstance,field:'hostPassword')}" />
                                </td>
                            </tr> 
                                                                            
							<tr class="prop">
                                <td valign="top" class="name">
                                    <label for="attendeePassword">Password for Attendee?:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'attendeePassword','errors')}">
                                    <input type="text" id="attendeePassword" name="attendeePassword" value="${fieldValue(bean:scheduleInstance,field:'attendeePassword')}" />
                                </td>
                            </tr> 
                                                                                                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="record">Record the conference?:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'record','errors')}">
                                    <g:checkBox name="record" value="${scheduleInstance?.record}" ></g:checkBox>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="startDateTime">Please enter the start date and time:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:scheduleInstance,field:'startDateTime','errors')}">
                                    <g:datePicker name="startDateTime" value="${scheduleInstance?.startDateTime}" ></g:datePicker>
                                </td>
                            </tr> 
                        
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><input class="save" type="submit" value="Create" /></span>
                    <span class="button"><g:link controller="conference" action="show" id="${conferenceId}">Cancel</g:link></span>
                </div>
            </g:form>
        </div>
    </body>
</html>
