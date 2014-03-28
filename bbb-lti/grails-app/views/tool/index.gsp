<html>
    <head>
        <title><g:message code="tool.view.title" /></title>
        <link rel="stylesheet" href="${resource(dir:'css',file:'bootstrap.css')}" />
        <link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
    </head>
    <body>
<!-- tool.index  -->
        <h1 style="margin-left:20px; text-align: center;"><a title="<g:message code="tool.view.join" />" class="btn btn-primary btn-large" href="${createLink(controller:'tool', action:'join', id: '0')}"><g:message code="tool.view.join" /></a></h1>
        <br><br>
        <div class="table-responsive">
        <table class="table table-striped table-bordered table-condensed">
            <thead>
                <tr>
                    <th class="header c0" style="text-align:center;" scope="col"><g:message code="tool.view.recording" /></th>
                    <th class="header c1" style="text-align:center;" scope="col"><g:message code="tool.view.activity" /></th>
                    <th class="header c2" style="text-align:center;" scope="col"><g:message code="tool.view.description" /></th>
                    <th class="header c3" style="text-align:center;" scope="col"><g:message code="tool.view.date" /></th>
                    <th class="header c4" style="text-align:center;" scope="col"><g:message code="tool.view.duration" /></th>
                    <g:if test="${ismoderator}">
                    <th class="header c5 lastcol" style="text-align:center;" scope="col"><g:message code="tool.view.actions" /></th>
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
                    <td class="cell c5 lastcol" style="text-align:center;">
                      <g:if test="${r.published == 'true'}">
                      <button class="btn btn-default btn-xs" name="unpublish_recording" type="submit" value="${r.recordID}" onClick="window.location='${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}'; return false;"><g:message code="tool.view.unpublishRecording" /></button>
                      </g:if>
                      <g:else>
                      <button class="btn btn-default btn-xs" name="publish_recording" type="submit" value="${r.recordID}" onClick="window.location='${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}'; return false;"><g:message code="tool.view.publishRecording" /></button>
                      </g:else>
                      <button class="btn btn-danger btn-xs" name="delete_recording" type="submit" value="${r.recordID}" onClick="if(confirm('<g:message code="tool.view.deleteRecordingConfirmation" />')) window.location='${createLink(controller:'tool',action:'delete',id: '0')}?bbb_recording_id=${r.recordID}'; return false;"><g:message code="tool.view.deleteRecording" /></button>
                    </td>
                    </g:if>
                </tr>
                </g:if>
            </g:each>
            </tbody>
        </table>
        </div>
    </body>
</html>