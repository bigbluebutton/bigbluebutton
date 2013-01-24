<html>
    <head>
        <title>Welcome to Grails</title>
		<meta name="layout" content="main" />
    </head>
    <body>
        <h1 style="margin-left:20px;">Welcome to BigBlueButton LTI interface</h1>
        <p style="margin-left:20px;width:80%">Congratulations, you have successfully started your first Grails application! At the moment
        this is the default page, feel free to modify it to either redirect to a controller or display whatever
        content you may choose. Below is a list of controllers that are currently deployed in this application,
        click on each to execute its default action:</p>
        <div class="dialog" style="margin-left:20px;width:60%;">
            <ul>
              <g:each var="c" in="${grailsApplication.controllerClasses}">
                    <li class="controller"><g:link controller="${c.logicalPropertyName}">${c.fullName}</g:link></li>
              </g:each>
            </ul>
        </div>
        
        <table class="generaltable">
            <thead>
                <tr>
                    <th class="header c0" style="text-align:center;" scope="col">Recording</th>
                    <th class="header c1" style="text-align:center;" scope="col">Activity</th>
                    <th class="header c2" style="text-align:center;" scope="col">Description</th>
                    <th class="header c3" style="text-align:center;" scope="col">Date</th>
                    <th class="header c4" style="text-align:center;" scope="col">Duration</th>
                    <th class="header c5 lastcol" style="text-align:left;" scope="col">Toolbar</th>
                </tr>
            </thead>
            <tbody>
                <tr class="r0 lastrow">
                    <td class="cell c0" style="text-align:center;"><a title="slides" target="_new" href="http://192.168.0.153/playback/slides/playback.html?meetingId=1c0aacd9be834a0e507601d8f7bbcd63f1902f4a-1359055850614">slides</a>&#32;</td>
                    <td class="cell c1" style="text-align:center;">Introductory session</td>
                    <td class="cell c2" style="text-align:center;"></td>
                    <td class="cell c3" style="text-align:center;">Thu&nbsp;Jan&nbsp;24&nbsp;14:30:52&nbsp;EST&nbsp;2013</td>
                    <td class="cell c4" style="text-align:center;">1</td>
                    <td class="cell c5 lastcol" style="text-align:left;"><a title="Hide" class="action-icon" href="http://192.168.0.176/moodle24/mod/recordingsbn/view.php?id=7&amp;recordingid=1c0aacd9be834a0e507601d8f7bbcd63f1902f4a-1359055850614&amp;action=hide"><img title="Hide" alt="Hide" class="smallicon" src="http://192.168.0.176/moodle24/theme/image.php/standard/core/1357938788/t/hide" /></a><a title="Delete" class="action-icon" href="http://192.168.0.176/moodle24/mod/recordingsbn/view.php?id=7&amp;recordingid=1c0aacd9be834a0e507601d8f7bbcd63f1902f4a-1359055850614&amp;action=delete" id="action_link51018c7ac6bf04"><img title="Delete" alt="Delete" class="smallicon" src="http://192.168.0.176/moodle24/theme/image.php/standard/core/1357938788/t/delete" /></a></td>
                </tr>
            </tbody>
        </table>
        
    </body>
</html>