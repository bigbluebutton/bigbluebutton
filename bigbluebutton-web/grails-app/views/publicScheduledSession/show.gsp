
<%@ page import="org.bigbluebutton.web.domain.ScheduledSession" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="layout" content="main" />
        <title>Show ScheduledSession</title>
    </head>
    <body>
        <div class="nav">
            <span class="menuButton"><a class="home" href="${createLinkTo(dir:'')}">Home</a></span>
        </div>
        <div class="body">
            <h1>Information on ${scheduledSessionInstance.name}</h1>
            <g:if test="${flash.message}">
            	<div class="message">${flash.message}</div>
            </g:if>
            <div class="dialog">
                <table>
                    <tbody>
                        <tr class="prop">
                            <td valign="top" class="name">Session:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'name')}</td>
                            
                        </tr>
                    
                    	<tr class="prop">
                            <td valign="top" class="name">Description:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'description')}</td>
                            
                        </tr>
                        
                        
                        
                    	<tr class="prop">
                            <td valign="top" class="name">Voice Conference Bridge:</td>
                            
                            <td valign="top" class="value">${fieldValue(bean:scheduledSessionInstance, field:'voiceConferenceBridge')}</td>
                            
                        </tr>
                       
                        <tr class="prop">
                            <td valign="top" class="name">Link:</td>
                            
                            <td valign="top" class="value">
                            <g:if test="${inSession}">
                            	<a href="${hostUrl}/bigbluebutton/conference-session/joinIn/${scheduledSessionInstance.tokenId}">Join</a>
							</g:if>
                            <g:else>
     							<a href="${hostUrl}/bigbluebutton/conference-session/joinIn/${scheduledSessionInstance.tokenId}">Play</a>   							
							</g:else>
                            	
							</td>
                            
                        </tr>
                    
                    	<tr class="prop">
                            <td valign="top" class="name">Start Date Time:</td>
                            
                            <td valign="top" class="value">
                            	<g:formatDate format="EEE, d MMM yyyy 'at' hh:mm aaa" date="${scheduledSessionInstance.startDateTime}"/> 
                            </td>
                            
                        </tr>
                        
                        <tr class="prop">
                            <td valign="top" class="name">End Date Time:</td>                           
                            <td valign="top" class="value">
                            	<g:formatDate format="EEE, d MMM yyyy 'at' hh:mm aaa" date="${scheduledSessionInstance.endDateTime}"/>                            	
                            </td>
                            
                        </tr>
               
                        <tr class="prop">
                            <td valign="top" class="name">Conference:</td>
                            
                            <td valign="top" class="value">
                            	${scheduledSessionInstance?.conference?.name.encodeAsHTML()}</td>
                            
                        </tr>
        
                    </tbody>
                </table>
            </div>
        </div>
    </body>
</html>
