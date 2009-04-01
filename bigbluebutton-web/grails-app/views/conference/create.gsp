

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
            <g:hasErrors bean="${conferenceInstance}">
            <div class="errors">
                <g:renderErrors bean="${conferenceInstance}" as="list" />
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
                                <td valign="top" class="value ${hasErrors(bean:conferenceInstance,field:'conferenceName','errors')}">
                                    <input type="text" id="conferenceName" name="conferenceName" value="${fieldValue(bean:conferenceInstance,field:'conferenceName')}"/>
                                </td>
                            </tr> 

                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="conferenceNumber">Conference Number:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:conferenceInstance,field:'conferenceNumber','errors')}">
                                    <input type="text" id="conferenceNumber" name="conferenceNumber" value="${fieldValue(bean:conferenceInstance,field:'conferenceNumber')}"/>
                                </td>
                            </tr> 
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><input class="save" type="submit" value="Create" /></span>
                </div>
            </g:form>
        </div>
    </body>
</html>
