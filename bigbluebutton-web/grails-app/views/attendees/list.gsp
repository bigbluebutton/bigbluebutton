

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Attendees List</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="create" action="create">New Attendees</g:link></span>
        </div>
        <div class="body">
            <h1>Attendees List</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                        
                   	        <g:sortableColumn property="id" title="Id" />
                        
                   	        <g:sortableColumn property="callerName" title="Caller Name" />
                        
                   	        <g:sortableColumn property="callerNumber" title="Caller Number" />
                        
                   	        <g:sortableColumn property="channelId" title="Channel Id" />
                        
                   	        <g:sortableColumn property="conferenceNumber" title="Conference Number" />
                        
                   	        <g:sortableColumn property="dateJoined" title="Date Joined" />
                        
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${attendeesList}" status="i" var="attendees">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">
                        
                            <td><g:link action="show" id="${attendees.id}">${attendees.id?.encodeAsHTML()}</g:link></td>
                        
                            <td>${attendees.callerName?.encodeAsHTML()}</td>
                        
                            <td>${attendees.callerNumber?.encodeAsHTML()}</td>
                        
                            <td>${attendees.channelId?.encodeAsHTML()}</td>
                        
                            <td>${attendees.conferenceNumber?.encodeAsHTML()}</td>
                        
                            <td>${attendees.dateJoined?.encodeAsHTML()}</td>
                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <div class="paginateButtons">
                <g:paginate total="${Attendees.count()}" />
            </div>
        </div>
    </body>
</html>
