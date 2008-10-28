

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Create Conference</title>         
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">Conference List</g:link></span>
        </div>
        <div class="body">
            <h1>Create Conference</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${conference}">
            <div class="errors">
                <g:renderErrors bean="${conference}" as="list" />
            </div>
            </g:hasErrors>
            <g:form action="save" method="post" >
                <div class="dialog">
                    <table>
                        <tbody>
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="conferenceName">Conference Name:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'conferenceName','errors')}">
                                    <input type="text" id="conferenceName" name="conferenceName" value="${fieldValue(bean:conference,field:'conferenceName')}"/>
                                </td>
                            </tr> 
                                                
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="startDateTime">Start Date Time:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'startDateTime','errors')}">
                                    <g:datePicker name="startDateTime" value="${conference?.startDateTime}" years="${2008..2020}"></g:datePicker>
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="lengthOfConference">Length Of Conference:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'lengthOfConference','errors')}">
                                    <g:select id="lengthOfConference" name="lengthOfConference" from="${conference.constraints.lengthOfConference.inList.collect{it.encodeAsHTML()}}" value="${fieldValue(bean:conference,field:'lengthOfConference')}" ></g:select>
                                	hour(s).
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="numberOfAttendees">Number Of Attendees:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'numberOfAttendees','errors')}">
                                    <input type="text" id="numberOfAttendees" name="numberOfAttendees" value="${fieldValue(bean:conference,field:'numberOfAttendees')}" />
                                </td>
                            </tr> 
                        
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="email">Booked By:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'email','errors')}">
                                    ${conference?.email}
                                </td>
                            </tr> 
                                                
                            <!--tr class="prop">
                                <td valign="top" class="name">
                                    <label for="owner">Owner:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conference,field:'owner','errors')}">
                                    ${conference?.fullname}
                                </td>
                            </tr--> 
                        
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><input class="save" type="submit" value="Create" /></span>
                </div>
            </g:form>
        </div>
        
		<g:render template="instructions" />

    </body>
</html>
