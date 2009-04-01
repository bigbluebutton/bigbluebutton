

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Schedule List</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="create" action="create">New Schedule</g:link></span>
        </div>
        <div class="body">
            <h1>Schedule List</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                        
                   	        <g:sortableColumn property="id" title="Id" />
                        
                   	        <g:sortableColumn property="scheduleName" title="Schedule Name" />
                        
                   	        <g:sortableColumn property="scheduleNumber" title="Schedule Number" />
                        
                   	        <g:sortableColumn property="lengthOfConference" title="Length Of Conference" />
                        
                   	        <g:sortableColumn property="numberOfAttendees" title="Number Of Attendees" />
                        
                   	        <g:sortableColumn property="scheduledBy" title="Scheduled By" />
                        
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${scheduleInstanceList}" status="i" var="scheduleInstance">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                        
                            <td><g:link action="show" id="${scheduleInstance.id}">${fieldValue(bean:scheduleInstance, field:'id')}</g:link></td>
                        
                            <td>${fieldValue(bean:scheduleInstance, field:'scheduleName')}</td>
                        
                            <td>${fieldValue(bean:scheduleInstance, field:'scheduleId')}</td>
                        
                            <td>${fieldValue(bean:scheduleInstance, field:'lengthOfConference')}</td>
                        
                            <td>${fieldValue(bean:scheduleInstance, field:'numberOfAttendees')}</td>
                        
                            <td>${fieldValue(bean:scheduleInstance, field:'scheduledBy')}</td>
                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <div class="paginateButtons">
                <g:paginate total="${Schedule.count()}" />
            </div>
        </div>
    </body>
</html>
