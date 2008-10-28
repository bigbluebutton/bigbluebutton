

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Edit Attendees</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">Attendees List</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New Attendees</g:link></span>
        </div>
        <div class="body">
            <h1>Edit Attendees</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${attendees}">
            <div class="errors">
                <g:renderErrors bean="${attendees}" as="list" />
            </div>
            </g:hasErrors>
            <g:form method="post" >
                <input type="hidden" name="id" value="${attendees?.id}" />
                <div class="dialog">
                    <table>
                        <tbody>
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="callerName">Caller Name:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'callerName','errors')}">
                                    <input type="text" id="callerName" name="callerName" value="${fieldValue(bean:attendees,field:'callerName')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="callerNumber">Caller Number:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'callerNumber','errors')}">
                                    <input type="text" id="callerNumber" name="callerNumber" value="${fieldValue(bean:attendees,field:'callerNumber')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="channelId">Channel Id:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'channelId','errors')}">
                                    <input type="text" id="channelId" name="channelId" value="${fieldValue(bean:attendees,field:'channelId')}"/>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="conferenceNumber">Conference Number:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'conferenceNumber','errors')}">
                                    <input type="text" id="conferenceNumber" name="conferenceNumber" value="${fieldValue(bean:attendees,field:'conferenceNumber')}" />
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="dateJoined">Date Joined:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'dateJoined','errors')}">
                                    <g:datePicker name="dateJoined" value="${attendees?.dateJoined}" ></g:datePicker>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="dateLeft">Date Left:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'dateLeft','errors')}">
                                    <g:datePicker name="dateLeft" value="${attendees?.dateLeft}" ></g:datePicker>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="userNumber">User Number:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:attendees,field:'userNumber','errors')}">
                                    <input type="text" id="userNumber" name="userNumber" value="${fieldValue(bean:attendees,field:'userNumber')}" />
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
