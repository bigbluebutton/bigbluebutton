

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Show Attendees</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">Attendees List</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New Attendees</g:link></span>
        </div>
        <div class="body">
            <h1>Show Attendees</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="dialog">
                <table>
                    <tbody>

                    
                        <tr class="prop">
                            <td valign="top" class="name">Id:</td>
                            
                            <td valign="top" class="value">${attendees.id}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Caller Name:</td>
                            
                            <td valign="top" class="value">${attendees.callerName}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Caller Number:</td>
                            
                            <td valign="top" class="value">${attendees.callerNumber}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Channel Id:</td>
                            
                            <td valign="top" class="value">${attendees.channelId}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Conference Number:</td>
                            
                            <td valign="top" class="value">${attendees.conferenceNumber}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Date Joined:</td>
                            
                            <td valign="top" class="value">${attendees.dateJoined}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">Date Left:</td>
                            
                            <td valign="top" class="value">${attendees.dateLeft}</td>
                            
                        </tr>
                    
                        <tr class="prop">
                            <td valign="top" class="name">User Number:</td>
                            
                            <td valign="top" class="value">${attendees.userNumber}</td>
                            
                        </tr>
                    
                    </tbody>
                </table>
            </div>
            <div class="buttons">
                <g:form>
                    <input type="hidden" name="id" value="${attendees?.id}" />
                    <span class="button"><g:actionSubmit class="edit" value="Edit" /></span>
                    <span class="button"><g:actionSubmit class="delete" onclick="return confirm('Are you sure?');" value="Delete" /></span>
                </g:form>
            </div>
        </div>
    </body>
</html>
