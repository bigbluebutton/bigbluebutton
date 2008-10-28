

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Conference List</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
            <span class="menuButton"><g:link class="create" action="create">New Conference</g:link></span>
            <span class="menuButton"><g:link class="create" action="list" params="[past: 'true']">Show Past Conferences</g:link></span>
        </div>
        <div class="body">
            <h1>Conference List</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>
                   	        <g:sortableColumn property="conferenceName" title="Conference Name" />
                        
                   	        <g:sortableColumn property="conferenceNumber" title="Conference ID" />
                        
                   	        <g:sortableColumn property="startDateTime" title="Start Date Time" />
                        
                   	        <g:sortableColumn property="lengthOfConference" title="Length Of Conference (hours)" />
                        
                   	        <g:sortableColumn property="numberOfAttendees" title="Number Of Attendees" />
                        
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${conferenceList}" status="i" var="conference">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">

                            <td><g:link action="show" id="${conference.id}">${conference.conferenceName?.encodeAsHTML()}</g:link></td>
                        
                            <td>${conference.conferenceNumber?.encodeAsHTML()}#</td>
                        
                            <td><g:formatDate format="EEE, d MMMM yyyy 'at' h:mm a" date="${conference.startDateTime}"/></td>
                        
                            <td>${conference.lengthOfConference?.encodeAsHTML()}</td>
                        
                            <td>${conference.numberOfAttendees?.encodeAsHTML()}</td>
                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <!--div class="paginateButtons">
                <g:paginate total="${Conference.count()}" />
            </div-->
        </div>
		<div class="body">
			<g:render template="instructions" />
		</div>
    </body>
</html>
