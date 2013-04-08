<!--

BigBlueButton - http://www.bigbluebutton.org

Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.

BigBlueButton is free software; you can redistribute it and/or modify it under the 
terms of the GNU Lesser General Public License as published by the Free Software 
Foundation; either version 3 of the License, or (at your option) any later 
version. 

BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along 
with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.

Author: Jesus Federico <jesus@123it.ca>

-->

<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<% 
	request.setCharacterEncoding("UTF-8"); 
	response.setCharacterEncoding("UTF-8"); 
%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<title>Record (Matterhorn)</title>
	<style type="text/css">
	 #formcreate{ 
	 	width:500px; 
	 	height:500px;
	 }
	 #formcreate ul{
	 	list-style:none;
	 }
	 #formcreate li{
	 	display:block;
	 	width:400px;
	 	margin-bottom:5px;
	 }
	 #formcreate label{
	 	display:block;
	 	float:left;
	 	width:150px;
	 	text-align:right;
	 }
	 #labdescription{
	 	vertical-align:top;
	 }
	</style>
</head>
<body>


<%@ include file="bbb_api.jsp"%>
<%@ include file="demo_header.jsp"%>

<%
	if (request.getParameterMap().isEmpty()) {
	    //
        // Assume we want to create a meeting
        //
%>
    <h2>Customized sessions using a dynamic config.xml</h2>

    <form id="formcreate" name="formcreate" method="get" action=""> 
        <fieldset>
            <legend>Meeting Information</legend>
            <ul>
                <li>
                    <label for="confname">Meeting Name:</label>
                    <input id="confname" autofocus required name="confname" type="text" />
                </li>
                <li>
                    <label for="username1">Your Name:</label>
                    <input id="username1" required name="username1" type="text" />	
                </li>
            </ul>
        </fieldset>
        <fieldset>
            <legend>Predefined layouts</legend>
            <label for="label_Layout">Select layout:</label>
                <select name="Layout">
                    <option value="Default" selected="selected">Default</option>
                    <option value="VideoChat">Video Chat</option>
                    <option value="Users">Users</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Webinar">Webinar</option>
                    <option value="LectureAssistant">Lecture assistant</option>
                    <option value="Lecture">Lecture</option>
                    <option value="S2SPresentation">S2SPresentation</option>
                    <option value="S2SVideoChat">S2SVideoChat</option>
                    <option value="Notes">Notes</option>
                    <option value="Broadcast">Broadcast</option>
                </select><br><br>
        </fieldset>
        <fieldset>
            <legend>Modules to be included</legend>
            <ul>
                <li><input type="checkbox" name="ChatModule" 
                    value="ChatModule">ChatModule<br></li>
                <li><input type="checkbox" name="ViewersModule" 
                    value="ViewersModule" disabled="disabled">ViewersModule<br></li>
                <li><input type="checkbox" name="ListenersModule"
                    value="ListenersModule" disabled="disabled">ListenersModule<br></li>
                <li><input type="hidden" name="UsersModule" value="UsersModule" />
                    <input type="checkbox" name="UsersModule"
                    value="UsersModule" checked="checked" disabled="disabled">UsersModule<br></li>
                <li><input type="checkbox" name="DeskShareModule"
                    value="DeskShareModule">DeskShareModule<br></li>
                <li><input type="hidden" name="PhoneModule" value="PhoneModule" />
                    <input type="checkbox" name="PhoneModule"
                    value="PhoneModule" checked="checked" disabled="disabled">PhoneModule<br></li>
                <li><input type="checkbox" name="VideoconfModule"
                    value="VideoconfModule">VideoconfModule<br></li>
                <li><input type="checkbox" name="WhiteboardModule"
                    value="WhiteboardModule">WhiteboardModule<br></li>
                <li><input type="checkbox" name="PresentModule"
                    value="PresentModule">PresentModule<br></li>
                <li><input type="checkbox" name="VideodockModule"
                    value="VideodockModule">VideodockModule<br></li>
                <li><input type="hidden" name="LayoutModule" value="LayoutModule" />
                    <input type="checkbox" name="LayoutModule"
                    value="LayoutModule" checked="checked" disabled="disabled">LayoutModule<br></li>
            </ul>
        </fieldset>
		
		<input type="submit" value="Create" >
		<input type="hidden" name="action" value="create" />
    </form>
	
<%
	} else if (request.getParameter("action").equals("create")) {
		String confname = request.getParameter("confname");
		String username = request.getParameter("username1");
		
		String configXML = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                           "<config>\n" +
                           "  <localeversion suppressWarning=\"false\">0.8</localeversion>\n" +
                           "  <version>C-4143-2013-04-02</version>\n" +
                           "  <help url=\"http://%BBBIP%/help.html\"/>\n" +
                           "  <porttest host=\"%BBBIP%\" application=\"video/portTest\" timeout=\"10000\"/>\n" +    
                           "  <bwMon server=\"HOST\" application=\"video/bwTest\"/>\n" +
                           "  <application uri=\"rtmp://%BBBIP%/bigbluebutton\" host=\"http://%BBBIP%/bigbluebutton/api/enter\" />\n" +
                           "  <language userSelectionEnabled=\"true\" />\n" +
                           "  <skinning enabled=\"true\" url=\"http://%BBBIP%/client/branding/css/BBBDefault.css.swf\" />\n" +
                           "  <shortcutKeys showButton=\"true\" />\n" +
                           "  <layout showLogButton=\"false\" showVideoLayout=\"false\" showResetLayout=\"true\" defaultLayout=\"%DEFAULTLAYOUT%\" showToolbar=\"true\" showFooter=\"true\" showHelpButton=\"true\" showLogoutWindow=\"true\"/>\n" +
                           "  <modules>\n" +
                           "%CHATMODULE%" + "%VIEWERSMODULE%" + "%LISTENERSMODULE%" + "%USERSMODULE%" + "%DESKSHAREMODULE%" + "%PHONEMODULE%" + "%VIDEOCONFMODULE%" + "%WHITEBOARDMODULE%" + "%PRESENTMODULE%" + "%VIDEODOCKMODULE%" + "%LAYOUTMODULE%\n" +
                           "  </modules>\n" +
                           "</config>\n";
	              
        String chatModule = "    <module name=\"ChatModule\" url=\"http://%BBBIP%/client/ChatModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" dependsOn=\"UsersModule\" translationOn=\"false\" translationEnabled=\"false\" privateEnabled=\"true\" position=\"top-right\" baseTabIndex=\"701\" />\n";
        String viewersModule = "    <module name=\"ViewersModule\" url=\"http://%BBBIP%/client/ViewersModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" host=\"http://%BBBIP%/bigbluebutton/api/enter\" allowKickUser=\"false\" baseTabIndex=\"201\" />\n";
        String listenersModule = "    <module name=\"ListenersModule\" url=\"http://%BBBIP%/client/ListenersModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" recordingHost=\"http://%BBBIP%\" position=\"bottom-left\" baseTabIndex=\"301\" />\n";
        String usersModule = "    <module name=\"UsersModule\" url=\"http://%BBBIP%/client/UsersModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" />\n";
        String deskShareModule = "    <module name=\"DeskShareModule\" url=\"http://%BBBIP%/client/DeskShareModule.swf?v=4105\" uri=\"rtmp://%BBBIP%/deskShare\" showButton=\"true\" autoStart=\"false\" baseTabIndex=\"101\" />\n";
        String phoneModule = "    <module name=\"PhoneModule\" url=\"http://%BBBIP%/client/PhoneModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/sip\" autoJoin=\"true\" skipCheck=\"false\" showButton=\"true\" enabledEchoCancel=\"true\" dependsOn=\"UsersModule\" />\n";
        String videoconfModule = "    <module name=\"VideoconfModule\" url=\"http://%BBBIP%/client/VideoconfModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/video\" dependson = \"UsersModule\" videoQuality = \"100\" presenterShareOnly = \"false\" controlsForPresenter = \"false\" resolutions = \"320x240,640x480,1280x720\" autoStart = \"false\" showButton = \"true\" showCloseButton = \"true\" publishWindowVisible = \"true\" viewerWindowMaxed = \"false\" viewerWindowLocation = \"top\" camKeyFrameInterval = \"30\" camModeFps = \"10\" camQualityBandwidth = \"0\" camQualityPicture = \"90\" smoothVideo=\"false\" applyConvolutionFilter=\"false\" convolutionFilter=\"-1, 0, -1, 0, 6, 0, -1, 0, -1\" filterBias=\"0\" filterDivisor=\"4\" enableH264 = \"true\" h264Level = \"2.1\" h264Profile = \"main\" displayAvatar = \"false\" focusTalking = \"false\" />\n";
        String whiteboardModule = "    <module name=\"WhiteboardModule\" url=\"http://%BBBIP%/client/WhiteboardModule.swf?v=4105\" uri=\"rtmp://%BBBIP%/bigbluebutton\" dependsOn=\"PresentModule\" baseTabIndex=\"601\" />\n";
        String presentModule = "    <module name=\"PresentModule\" url=\"http://%BBBIP%/client/PresentModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" host=\"http://%BBBIP%\" showPresentWindow=\"true\" showWindowControls=\"true\" dependsOn=\"UsersModule\" baseTabIndex=\"501\" maxFileSize=\"30\" />\n";
        String videodockModule = "    <module name=\"VideodockModule\" url=\"http://%BBBIP%/client/VideodockModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" dependsOn=\"VideoconfModule, UsersModule\" autoDock=\"true\" showControls=\"true\" maximizeWindow=\"false\" position=\"bottom-right\" width=\"172\" height=\"179\" layout=\"smart\" oneAlwaysBigger=\"false\" baseTabIndex=\"401\" />\n";
        String layoutModule = "    <module name=\"LayoutModule\" url=\"http://%BBBIP%/client/LayoutModule.swf?v=4143\" uri=\"rtmp://%BBBIP%/bigbluebutton\" layoutConfig=\"http://%BBBIP%/client/conf/layout.xml\" enableEdit=\"true\" />\n";

        
        String param_ChatModule = request.getParameter("ChatModule");
        String param_ViewersModule = request.getParameter("ViewersModule");
        String param_ListenersModule = request.getParameter("ListenersModule");
        String param_UsersModule = request.getParameter("UsersModule");
        String param_DeskShareModule = request.getParameter("DeskShareModule");
        String param_PhoneModule = request.getParameter("PhoneModule");
        String param_VideoconfModule = request.getParameter("VideoconfModule");
        String param_WhiteboardModule = request.getParameter("WhiteboardModule");
        String param_PresentModule = request.getParameter("PresentModule");
        String param_VideodockModule = request.getParameter("VideodockModule");
        String param_LayoutModule = request.getParameter("LayoutModule");
        
        String param_Layout = request.getParameter("Layout");
        configXML = ( request.getParameter("Layout") != null )? configXML.replace("%DEFAULTLAYOUT%", param_Layout): configXML.replace("%DEFAULTLAYOUT%", "Default");

        configXML = ( request.getParameter("ChatModule") != null )? configXML.replace("%CHATMODULE%", chatModule): configXML.replace("%CHATMODULE%", "");
        configXML = ( request.getParameter("ViewersModule") != null )? configXML.replace("%VIEWERSMODULE%", viewersModule): configXML.replace("%VIEWERSMODULE%", "");
        configXML = ( request.getParameter("ListenersModule") != null )? configXML.replace("%LISTENERSMODULE%", listenersModule): configXML.replace("%LISTENERSMODULE%", "");
        configXML = ( request.getParameter("UsersModule") != null )? configXML.replace("%USERSMODULE%", usersModule): configXML.replace("%USERSMODULE%", "");
        configXML = ( request.getParameter("DeskShareModule") != null )? configXML.replace("%DESKSHAREMODULE%", deskShareModule): configXML.replace("%DESKSHAREMODULE%", "");
        configXML = ( request.getParameter("PhoneModule") != null )? configXML.replace("%PHONEMODULE%", phoneModule): configXML.replace("%PHONEMODULE%", "");
        configXML = ( request.getParameter("VideoconfModule") != null )? configXML.replace("%VIDEOCONFMODULE%", videoconfModule): configXML.replace("%VIDEOCONFMODULE%", "");
        configXML = ( request.getParameter("WhiteboardModule") != null )? configXML.replace("%WHITEBOARDMODULE%", whiteboardModule): configXML.replace("%WHITEBOARDMODULE%", "");
        configXML = ( request.getParameter("PresentModule") != null )? configXML.replace("%PRESENTMODULE%", presentModule): configXML.replace("%PRESENTMODULE%", "");
        configXML = ( request.getParameter("VideodockModule") != null )? configXML.replace("%VIDEODOCKMODULE%", videodockModule): configXML.replace("%VIDEODOCKMODULE%", "");
        configXML = ( request.getParameter("LayoutModule") != null )? configXML.replace("%LAYOUTMODULE%", layoutModule): configXML.replace("%LAYOUTMODULE%", "");
        
        configXML = configXML.replace("%BBBIP%", getBigBlueButtonIP());
		//
		// This is the URL for to join the meeting as moderator
		//
		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String joinURL = getJoinURLwithDynamicConfigXML(username, confname, configXML);

		if (joinURL.startsWith("http://")) { 
%>
            <h2>Customized sessions using a dynamic config.xml, submit</h2>

            <script language="javascript" type="text/javascript">
                window.location.href="<%=joinURL%>";
            </script>

<%
        } else {
%>
            <p>Error: <br>
                &nbsp;&nbsp;getJoinURL() failed
            </p>
            <p>
            <%=joinURL %>
            </p>
            
<% 
        }
    } 
%>


<%@ include file="demo_footer.jsp"%>

</body>
</html>
