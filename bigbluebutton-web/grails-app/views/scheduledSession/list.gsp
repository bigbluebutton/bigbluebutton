
<%@ page import="org.bigbluebutton.web.domain.ScheduledSession" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>ScheduledSession List</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="create" action="create">New ScheduledSession</g:link></span>
        </div>
        <div class="body">
            <h1>ScheduledSession List</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                        
                   	        <g:sortableColumn property="id" title="Id" />
                        
                   	        <g:sortableColumn property="name" title="Name" />
                        
                   	        <g:sortableColumn property="tokenId" title="Token Id" />
                        
                   	        <g:sortableColumn property="sessionId" title="Session Id" />
                        
                   	        <g:sortableColumn property="numberOfAttendees" title="Number Of Attendees" />
                        
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${scheduledSessionInstanceList}" status="i" var="scheduledSessionInstance">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                        
                            <td><g:link action="show" id="${scheduledSessionInstance.id}">${fieldValue(bean:scheduledSessionInstance, field:'id')}</g:link></td>
                        
                            <td>${fieldValue(bean:scheduledSessionInstance, field:'name')}</td>
                        
                            <td>${fieldValue(bean:scheduledSessionInstance, field:'tokenId')}</td>
                        
                            <td>${fieldValue(bean:scheduledSessionInstance, field:'sessionId')}</td>
                        
                            <td>${fieldValue(bean:scheduledSessionInstance, field:'numberOfAttendees')}</td>
                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <div class="paginateButtons">
                <g:paginate total="${ScheduledSession.count()}" />
            </div>
        </div>
    </body>
</html>
