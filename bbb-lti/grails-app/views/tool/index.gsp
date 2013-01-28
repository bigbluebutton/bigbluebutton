<html>
    <head>
        <title>BigBlueButton LTI Interface</title>
		<meta name="layout" content="internal" />
    </head>
    <body>
        <h1 style="margin-left:20px; text-align: center;"><a title="Join" class="action-icon" href="${createLink(controller:'tool',action:'join')}"><img title="Join" alt="Join the meeting" src="${resource(dir:'images',file:'bbb.jpg')}" /></a></h1>
        <p style="margin-left:20px;width:80%"></p>
        <br>
        <table class="generaltable">
            <thead>
                <tr>
                    <th class="header c0" style="text-align:center;" scope="col">Recording</th>
                    <th class="header c1" style="text-align:center;" scope="col">Activity</th>
                    <th class="header c2" style="text-align:center;" scope="col">Description</th>
                    <th class="header c3" style="text-align:center;" scope="col">Date</th>
                    <th class="header c4" style="text-align:center;" scope="col">Duration</th>
                    <g:if test="${ismoderator}">
                    <th class="header c5 lastcol" style="text-align:left;" scope="col">Toolbar</th>
                    </g:if>
                </tr>
            </thead>
            <tbody>
            <g:each in="${recordingList}" var="r">
                <tr class="r0 lastrow">
                    <td class="cell c0" style="text-align:center;">
                    <g:each in="${r.playback}" var="p">
                        <a title="${p.type}" target="_new" href="${p.url}">${p.type}</a>&#32;
                    </g:each>
                    </td>
                    <td class="cell c1" style="text-align:center;">${r.name}</td>
                    <td class="cell c2" style="text-align:center;">${r.metadata.contextactivitydescription}</td>
                    <td class="cell c3" style="text-align:center;">${new Date( Long.valueOf(r.startTime).longValue() )}</td>
                    <td class="cell c4" style="text-align:center;">
                    <g:each in="${r.playback}" var="p">
                        <g:if test="${p.type == 'slides'}">
                            ${p.length}
                        </g:if>
                    </g:each>
                    </td>
                    <g:if test="${ismoderator}">
                    <td class="cell c5 lastcol" style="text-align:left;">
                      <g:if test="${r.published == 'true'}">
                      <a title="Hide" class="action-icon" href="${createLink(controller:'tool',action:'publish')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><img title="Hide" alt="Hide" class="smallicon" src="${resource(dir:'images',file:'hide.gif')}" /></a>
                      </g:if>
                      <g:else>
                      <a title="Show" class="action-icon" href="${createLink(controller:'tool',action:'publish')}?bbb_recording_published=${r.published}&bbb_recording_id=${r.recordID}"><img title="Show" alt="Show" class="smallicon" src="${resource(dir:'images',file:'show.gif')}" /></a>
                      </g:else>
                      <a title="Delete" class="action-icon" onClick="if(confirm('Are you sure to delete this recording?')) window.location='${createLink(controller:'tool',action:'delete')}?bbb_recording_id=${r.recordID}'; return false;" href="#"><img title="Delete" alt="Delete" class="smallicon" src="${resource(dir:'images',file:'delete.gif')}" /></a>
                    </td>
                    </g:if>
                </tr>
            </g:each>
            </tbody>
        </table>
        
    </body>
</html>