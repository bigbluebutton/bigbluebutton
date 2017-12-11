<html>
    <head>
        <title><g:message code="tool.view.title" /></title>
        <link rel="shortcut icon" href="${assetPath(src: 'favicon.ico')}" type="image/x-icon">
        <asset:stylesheet src="bootstrap.css"/>
        <asset:stylesheet src="dataTables.bootstrap.min.css"/>
        <asset:javascript src="jquery.js"/>
        <asset:javascript src="jquery.dataTables.min.js"/>
        <asset:javascript src="dataTables.bootstrap.min.js"/>
        <asset:javascript src="dataTables.plugin.datetime.js"/>
        <asset:javascript src="moment-with-locales.min.js"/>
        <asset:javascript src="bootstrap.js"/>
        <asset:javascript src="bootstrap-confirmation.min.js"/>
        <asset:javascript src="tool.js"/>
    </head>
    <body>
        <h1 style="margin-left:20px; text-align: center;"><a title="<g:message code="tool.view.join" />" class="btn btn-primary btn-large" href="${createLink(controller:'tool', action:'join', id: '0')}"><g:message code="tool.view.join" /></a></h1>
        <br><br>
        <div class="container">
        <table id="recordings" class="table table-striped table-bordered dt-responsive" width="100%">
            <thead>
                <tr>
                    <th class="header c0" style="text-align:center;" scope="col"><g:message code="tool.view.recording" /></th>
                    <th class="header c1" style="text-align:center;" scope="col"><g:message code="tool.view.activity" /></th>
                    <th class="header c2" style="text-align:center;" scope="col"><g:message code="tool.view.description" /></th>
                    <th class="header c3" style="text-align:center;" scope="col"><g:message code="tool.view.preview" /></th>
                    <th class="header c4" style="text-align:center;" scope="col"><g:message code="tool.view.date" /></th>
                    <th class="header c5" style="text-align:center;" scope="col"><g:message code="tool.view.duration" /></th>
                    <g:if test="${ismoderator}">
                    <th class="header c6 lastcol" style="text-align:center;" scope="col"><g:message code="tool.view.actions" /></th>
                    </g:if>
                </tr>
            </thead>
            <tbody>
            <g:each in="${recordingList}" var="r">
                <g:if test="${ismoderator || r.published == 'true'}">
                <tr class="r0 lastrow">
                    <td class="cell c0" style="text-align:center;">
                    <g:if test="${r.published}">
                        <g:each in="${r.playback}" var="format">
                            <a title="<g:message code="tool.view.recording.format.${format.getValue().type}" />" target="_new" href="${format.getValue().url}"><g:message code="tool.view.recording.format.${format.getValue().type}" /></a>&#32;
                        </g:each>
                    </g:if>
                    </td>
                    <td class="cell c1" style="text-align:left;">${r.name}</td>
                    <td class="cell c2" style="text-align:left;">${r.metadata.contextactivitydescription}</td>
                    <td class="cell c3" style="text-align:left;">${r.metadata.contextactivitydescription}</td>
                    <td class="cell c4" style="text-align:left;">${r.reportDate}</td>
                    <td class="cell c5" style="text-align:right;">${r.duration}</td>
                    <g:if test="${ismoderator}">
                    <td class="cell c6 lastcol" style="text-align:center;">
                      <g:if test="${r.published == 'true'}">
                      <a title="<g:message code="tool.view.recording.unpublish" />" class="btn btn-default btn-sm glyphicon glyphicon-eye-close" name="unpublish_recording" type="submit" value="${r.recordID}" href="${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"></a>
                      </g:if>
                      <g:else>
                      <a title="<g:message code="tool.view.recording.publish" />" class="btn btn-default btn-sm glyphicon glyphicon-eye-open" name="publish_recording" type="submit" value="${r.recordID}" href="${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"></a>
                      </g:else>
                      <a title="<g:message code="tool.view.recording.delete" />" class="btn btn-danger btn-sm glyphicon glyphicon-trash" name="delete_recording" value="${r.recordID}"
                        data-toggle="confirmation"
                        data-title="<g:message code="tool.view.recording.delete.confirmation.warning" />"
                        data-content="<g:message code="tool.view.recording.delete.confirmation" />"
                        data-btn-ok-label="<g:message code="tool.view.recording.delete.confirmation.yes" />"
                        data-btn-cancel-label="<g:message code="tool.view.recording.delete.confirmation.no" />"
                        data-placement="left"
                        href="${createLink(controller:'tool',action:'delete',id: '0')}?bbb_recording_id=${r.recordID}">
                      </a>
                    </td>
                    </g:if>
                </tr>
                </g:if>
            </g:each>
            </tbody>
        </table>
        </div>
    </body>
    <g:javascript>
        var locale = '${params.launch_presentation_locale}';
    </g:javascript>
</html>
