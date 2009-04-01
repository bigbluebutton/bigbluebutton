

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
        </div>
        <div class="body">
            <h1>Your Conferences</h1>
            <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
            </g:if>
            <div class="list">
                <table>
                    <thead>
                        <tr>                                                                    
                   	        <g:sortableColumn property="conferenceName" title="Conference Name" />                        
                   	        <g:sortableColumn property="conferenceNumber" title="Conference Number" />                        
                   	        <g:sortableColumn property="username" title="Username" /> 
                   	        <g:sortableColumn property="dateCreated" title="Date Created" />                        
                   	        <g:sortableColumn property="lastUpdated" title="Last Updated" />                        
                        </tr>
                    </thead>
                    <tbody>
                    <g:each in="${conferenceList}" status="i" var="conference">
                        <tr class="${(i % 2) == 0 ? 'odd' : 'even'}">                                                               
                            <td><g:link action="show" id="${conference.id}">${fieldValue(bean:conference, field:'conferenceName')}</g:link></td>                        
                            <td>${fieldValue(bean:conference, field:'conferenceNumber')}</td>                       
                            <td>${fieldValue(bean:conference, field:'username')}</td>        
                            <td>${fieldValue(bean:conference, field:'dateCreated')}</td>                        
                            <td>${fieldValue(bean:conference, field:'lastUpdated')}</td>                        
                        </tr>
                    </g:each>
                    </tbody>
                </table>
            </div>
            <div class="paginateButtons">
                <g:paginate total="${Conference.count()}" />
            </div>
        </div>
    </body>
</html>
