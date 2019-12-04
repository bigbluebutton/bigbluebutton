<html>
    <head>
        <title><g:message code="tool.view.title" /></title>
        <link rel="shortcut icon" type="image/x-icon" href="/lti/${assetPath(src: 'favicon.ico')}">
        <link rel="stylesheet" type="text/css" href="/lti/${assetPath(src: 'bootstrap.css')}" />
        <link rel="stylesheet" type="text/css" href="/lti/${assetPath(src: 'tool.css')}" />
        <script type="text/javascript" src="/lti/${assetPath(src: 'jquery.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'jquery.dataTables.min.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'dataTables.bootstrap.min.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'dataTables.plugin.datetime.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'moment-with-locales.min.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'bootstrap.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'bootstrap-confirmation.min.js')}"></script>
        <script type="text/javascript" src="/lti/${assetPath(src: 'tool.js')}"></script>
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
                    <g:else>
                    <th class="header c5 lastcol" style="text-align:center;" scope="col"></th>
                    </g:else>
                </tr>
            </thead>
            <tbody>
            <g:each in="${recordingList}" var="r">
                <g:if test="${ismoderator || r.published}">
                <tr class="r0 lastrow">
                    <td class="cell c0" style="text-align:center;">
                    <g:if test="${r.published}">
                        <g:each in="${r.playbacks}" var="format">
                            <a title="<g:message code="tool.view.recording.format.${format.type}" />" target="_new" href="${format.url}"><g:message code="tool.view.recording.format.${format.type}" /></a><br>
                        </g:each>
                    </g:if>
                    </td>
                    <td class="cell c1" style="text-align:left;">${r.name}</td>
                    <td class="cell c2" style="text-align:left;">${r.metadata.contextactivitydescription}</td>
                    <td class="cell c3" style="text-align:left;">
                    <g:if test="${r.published}">
                        <div>
                        <g:each in="${r.thumbnails}" var="thumbnail">
                            <g:each in="${thumbnail.content}" var="thumbnail_url">
                                <img src="${thumbnail_url}" class="thumbnail"/>
                            </g:each>
                        </g:each>
                        </div>
                  </g:if>
                    </td>
                    <td class="cell c4" style="text-align:left;">${r.reportDate}</td>
                    <td class="cell c5" style="text-align:right;">${r.duration}</td>
                    <g:if test="${ismoderator}">
                    <td class="cell c6 lastcol" style="text-align:center;">
                      <g:if test="${r.published}">
                      <a title="<g:message code="tool.view.recording.unpublish" />" class="btn btn-default btn-sm glyphicon glyphicon-eye-open" name="unpublish_recording" type="submit" value="${r.recordID}" href="${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><g:message code="tool.view.recording.unpublish" /></a>
                      </g:if>
                      <g:else>
                      <a title="<g:message code="tool.view.recording.publish" />" class="btn btn-default btn-sm glyphicon glyphicon-eye-close" name="publish_recording" type="submit" value="${r.recordID}" href="${createLink(controller:'tool',action:'publish',id: '0')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><g:message code="tool.view.recording.publish" /></a>
                      </g:else>
                      <a title="<g:message code="tool.view.recording.delete" />" class="btn btn-danger btn-sm glyphicon glyphicon-trash" name="delete_recording" value="${r.recordID}"
                        data-toggle="confirmation"
                        data-title="<g:message code="tool.view.recording.delete.confirmation.warning" />"
                        data-content="<g:message code="tool.view.recording.delete.confirmation" />"
                        data-btn-ok-label="<g:message code="tool.view.recording.delete.confirmation.yes" />"
                        data-btn-cancel-label="<g:message code="tool.view.recording.delete.confirmation.no" />"
                        data-placement="left"
                        href="${createLink(controller:'tool',action:'delete',id: '0')}?bbb_recording_id=${r.recordID}">
                        <g:message code="tool.view.recording.delete" />
                      </a>
                    </td>
                    </g:if>
                     <g:else>
                        <td class="cell c5 lastcol" style="text-align:center;">
                        </td>
                      </g:else>
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
