

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Edit User</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="list" action="list">User List</g:link></span>
            <span class="menuButton"><g:link class="create" action="create">New User</g:link></span>
        </div>
        <div class="body">
            <h1>Edit User</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <g:hasErrors bean="${userInstance}">
            <div class="errors">
                <g:renderErrors bean="${userInstance}" as="list" />
            </div>
            </g:hasErrors>
            <g:form method="post" >
                <input type="hidden" name="id" value="${userInstance?.id}" />
                <div class="dialog">
                    <table>
                        <tbody>                                              
                            <tr class="prop">
                                <td valign="top" class="name">
                                    <label for="password">New Password:</label>
                                </td>
                                <td valign="top" class="value ${hasErrors(bean:userInstance,field:'passwordHash','errors')}">
                                    <g:passwordField name="newpassword" value="" />
                                </td>
                            </tr> 
                                                
                        </tbody>
                    </table>
                </div>
                <div class="buttons">
                    <span class="button"><g:actionSubmit class="save" value="Update" action="updatepassword"/></span>
                    <span class="button"><g:link action="show" id="${userInstance?.id}">Cancel</g:link></span>
                </div>
            </g:form>
        </div>
    </body>
</html>
