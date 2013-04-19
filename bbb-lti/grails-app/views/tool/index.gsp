<html>
    <head>
        <title><g:message code="tool.view.title" /></title>
        <link rel="stylesheet" href="${resource(dir:'css',file:'bootstrap.css')}" />
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
    </head>
    <body>
        <h1 style="margin-left:20px; text-align: center;"><a title="<g:message code="tool.view.join" />" class="btn btn-primary btn-large" href="${createLink(controller:'tool',action:'join')}"><g:message code="tool.view.join" /></a></h1>
        <br><br>
        <table class="table table-striped table-bordered table-condensed">
            <thead>
                <tr>
                    <th class="header c0" style="text-align:center;" scope="col"><g:message code="tool.view.recording" /></th>
                    <th class="header c1" style="text-align:center;" scope="col"><g:message code="tool.view.activity" /></th>
                    <th class="header c2" style="text-align:center;" scope="col"><g:message code="tool.view.description" /></th>
                    <th class="header c3" style="text-align:center;" scope="col"><g:message code="tool.view.date" /></th>
                    <th class="header c4" style="text-align:center;" scope="col"><g:message code="tool.view.duration" /></th>
                    <g:if test="${ismoderator}">
                    <th class="header c5 lastcol" style="text-align:left;" scope="col"><g:message code="tool.view.actions" /></th>
                    </g:if>
                </tr>
            </thead>
            <tbody>
            <g:each in="${recordingList}" var="r">
                <g:if test="${ismoderator || r.published == 'true'}">  
                <tr class="r0 lastrow">
                    <td class="cell c0" style="text-align:center;">
                    <g:each in="${r.playback}" var="p">
                        <a title="${p.type}" target="_new" href="${p.url}">${p.type}</a>&#32;
                    </g:each>
                    </td>
                    <td class="cell c1" style="text-align:center;">${r.name}</td>
                    <td class="cell c2" style="text-align:center;">${r.metadata.contextactivitydescription}</td>
                    <td class="cell c3" style="text-align:center;">${new Date( Long.valueOf(r.startTime).longValue() )}</td>
                    <td class="cell c4" style="text-align:center;">${r.duration}</td>
                    <g:if test="${ismoderator}">
                    <td class="cell c5 lastcol" style="text-align:left;">
                      <g:if test="${r.published == 'true'}">
                      <a title="<g:message code="tool.view.unPublishRecording" />" class="action-icon" href="${createLink(controller:'tool',action:'publish')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><img title="<g:message code="tool.view.unpublishRecording" />" alt="<g:message code="tool.view.unpublishRecording" />" class="smallicon" src="${resource(dir:'images',file:'hide.gif')}" /></a>
                      </g:if>
                      <g:else>
                      <a title="<g:message code="tool.view.publishRecording" />" class="action-icon" href="${createLink(controller:'tool',action:'publish')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><img title="<g:message code="tool.view.publishRecording" />" alt="<g:message code="tool.view.publishRecording" />" class="smallicon" src="${resource(dir:'images',file:'show.gif')}" /></a>
                      </g:else>
                      <a title="<g:message code="tool.view.deleteRecording" />" class="action-icon" onClick="if(confirm('<g:message code="tool.view.deleteRecordingConfirmation" />')) window.location='${createLink(controller:'tool',action:'delete')}?bbb_recording_id=${r.recordID}'; return false;" href="#"><img title="<g:message code="tool.view.deleteRecording" />" alt="<g:message code="tool.view.deleteRecording" />" class="smallicon" src="${resource(dir:'images',file:'delete.gif')}" /></a>
                    </td>
                    </g:if>
                </tr>
                </g:if>
            </g:each>
            </tbody>
        </table>
        
    </body>
</html>