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
            <legend>Modules to be included</legend>
            <ul>
                <li><label for="label_Layout">Select predefined layout:</label>
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
                    </select><br>
                </li>
                <li><input type="checkbox" name="ChatModule" 
                    value="ChatModule">ChatModule<br></li>
                <li><input type="checkbox" name="ViewersModule"
                    value="ViewersModule" checked="checked" disabled>ViewersModule<br></li>
                <li><input type="checkbox" name="ListenersModule"
                    value="ListenersModule" checked="checked" disabled>ListenersModule<br></li>
                <li><input type="checkbox" name="DeskShareModule"
                    value="DeskShareModule">DeskShareModule<br></li>
                <li><input type="checkbox" name="PhoneModule"
                    value="PhoneModule" checked="checked" disabled>PhoneModule<br></li>
                <li><input type="checkbox" name="VideoconfModule"
                    value="VideoconfModule">VideoconfModule<br></li>
                <li><input type="checkbox" name="WhiteboardModule"
                    value="WhiteboardModule">WhiteboardModule<br></li>
                <li><input type="checkbox" name="PresentModule"
                    value="PresentModule">PresentModule<br></li>
                <li><input type="checkbox" name="VideodockModule"
                    value="VideodockModule">VideodockModule<br></li>
                <li><input type="checkbox" name="LayoutModule"
                    value="LayoutModule" checked="checked" disabled>LayoutModule<br></li>
            </ul>
        </fieldset>
		
		<input type="submit" value="Create" >
		<input type="hidden" name="action" value="create" />
	</form>

<%
	} else if (request.getParameter("action").equals("create")) {
		
		String confname = request.getParameter("confname");
		String username = request.getParameter("username1");
		
		String configXML = "\
<?xml version=\"1.0\" encoding=\"UTF-8\"?> \
<config> \
  <localeversion suppressWarning=\"false\">0.8</localeversion> \
  <version>4084-2013-01-30</version> \
  <help url=\"http://192.168.0.158/help.html\"/> \
  <porttest host=\"192.168.0.158\" application=\"video\" timeout=\"10000\"/> \
  <application uri=\"rtmp://192.168.0.158/bigbluebutton\" host=\"http://192.168.0.158/bigbluebutton/api/enter\" /> \
  <language userSelectionEnabled=\"true\" /> \
  <skinning enabled=\"true\" url=\"http://192.168.0.158/client/branding/css/BBBDefault.css.swf\" /> \
  <layout showLogButton=\"false\" showVideoLayout=\"false\" showResetLayout=\"true\" defaultLayout=\"%DEFAULTLAYOUT%\" showToolbar=\"true\" showFooter=\"true\" showHelpButton=\"true\" showLogoutWindow=\"true\"/> \
  <modules> \
    %CHATMODULE% \
    %VIEWERSMODULE% \
    %LISTENERSMODULE% \
    %DESKSHAREMODULE% \
    %PHONEMODULE% \
    %VIDEOCONFMODULE% \
    %WHITEBOARDMODULE% \
    %PRESENTMODULE% \
    %VIDEODOCKMODULE% \
    %LAYOUTMODULE% \
  </modules> \
</config>";
	              
	    String chatModule = "<module name=\"ChatModule\" url=\"http://192.168.0.158/client/ChatModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" dependsOn=\"ViewersModule\" translationOn=\"false\" translationEnabled=\"false\" privateEnabled=\"true\"  position=\"top-right\"/>"; 
        String viewersModule = "<module name=\"ViewersModule\" url=\"http://192.168.0.158/client/ViewersModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" host=\"http://192.168.0.158/bigbluebutton/api/enter\" allowKickUser=\"false\" />";
        String listenersModule = "<module name=\"ListenersModule\" url=\"http://192.168.0.158/client/ListenersModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" recordingHost=\"http://192.168.0.158\" position=\"bottom-left\" />"; 
        String deskShareModule = "<module name=\"DeskShareModule\" url=\"http://192.168.0.158/client/DeskShareModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/deskShare\" autoStart=\"false\" />";
        String phoneModule = "<module name=\"PhoneModule\" url=\"http://192.168.0.158/client/PhoneModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/sip\" autoJoin=\"true\" skipCheck=\"false\" showButton=\"true\" enabledEchoCancel=\"true\" dependsOn=\"ViewersModule\" />";
        String videoconfModule = "<module name=\"VideoconfModule\" url=\"http://192.168.0.158/client/VideoconfModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/video\" dependson = \"ViewersModule\" videoQuality = \"100\" presenterShareOnly = \"false\" controlsForPresenter = \"false\" resolutions = \"320x240,640x480,1280x720\" autoStart = \"false\" showButton = \"true\" showCloseButton = \"true\" publishWindowVisible = \"true\" viewerWindowMaxed = \"false\" viewerWindowLocation = \"top\" camKeyFrameInterval = \"30\" camModeFps = \"10\" camQualityBandwidth = \"0\" camQualityPicture = \"90\" smoothVideo=\"false\" applyConvolutionFilter=\"false\" convolutionFilter=\"-1, 0, -1, 0, 6, 0, -1, 0, -1\" filterBias=\"0\" filterDivisor=\"4\" enableH264 = \"true\" h264Level = \"2.1\" h264Profile = \"main\" displayAvatar = \"false\" />";
        String whiteboardModule = "<module name=\"WhiteboardModule\" url=\"http://192.168.0.158/client/WhiteboardModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" dependsOn=\"PresentModule\" />";
        String presentModule = "<module name=\"PresentModule\" url=\"http://192.168.0.158/client/PresentModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" host=\"http://192.168.0.158\" showPresentWindow=\"true\" showWindowControls=\"true\" dependsOn=\"ViewersModule\" />";
        String videodockModule = "<module name=\"VideodockModule\" url=\"http://192.168.0.158/client/VideodockModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" dependsOn=\"VideoconfModule, ViewersModule\" autoDock=\"true\" showControls=\"true\" maximizeWindow=\"false\" position=\"bottom-right\" width=\"172\" height=\"179\" layout=\"smart\" oneAlwaysBigger=\"false\" />";
        String layoutModule = "<module name=\"LayoutModule\" url=\"http://192.168.0.158/client/LayoutModule.swf?v=4084\" uri=\"rtmp://192.168.0.158/bigbluebutton\" layoutConfig=\"http://192.168.0.158/client/conf/layout.xml\" enableEdit=\"true\" />";
        
        if( request.getParameter("ChatModule") ) configXML.replace("%CHATMODULE%", chatModule); else configXML.replace("%CHATMODULE%", "");
        if( request.getParameter("ViewersModule") ) configXML.replace("%VIEWERSMODULE%", viewersModule); else configXML.replace("%VIEWERSMODULE%", "");
        if( request.getParameter("ListenersModule") ) configXML.replace("%LISTENERSMODULE%", listenersModule); else configXML.replace("%LISTENERSMODULE%", "");
        if( request.getParameter("DeskShareModule") ) configXML.replace("%DESKSHAREMODULE%", deskShareModule); else configXML.replace("%DESKSHAREMODULE%", "");
        if( request.getParameter("PhoneModule") ) configXML.replace("%PHONEMODULE%", phoneModule); else configXML.replace("%PHONEMODULE%", "");
        if( request.getParameter("VideoconfModule") ) configXML.replace("%VIDEOCONFMODULE%", videoconfModule); else configXML.replace("%VIDEOCONFMODULE%", "");
        if( request.getParameter("WhiteboardModule") ) configXML.replace("%WHITEBOARDMODULE%", whiteboardModule); else configXML.replace("%WHITEBOARDMODULE%", "");
        if( request.getParameter("PresentModule") ) configXML.replace("%PRESENTMODULE%", presentModule); else configXML.replace("%PRESENTMODULE%", "");
        if( request.getParameter("VideodockModule") ) configXML.replace("%VIDEODOCKMODULE%", videodockModule); else configXML.replace("%VIDEODOCKMODULE%", "");
        if( request.getParameter("LayoutModule") ) configXML.replace("%LAYOUTMODULE%", layoutModule); else configXML.replace("%LAYOUTMODULE%", "");

		//
		// This is the URL for to join the meeting as moderator
		//
		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String joinURL = getJoinURLwithDynamicConfigXML(username, confname, configXML);

		if (joinURL.startsWith("http://")) { 
%>

<script language="javascript" type="text/javascript">
  window.location.href="<%=joinURL%>";
</script>

<%
	} else {
%>

Error: getJoinURL() failed
<p/>
<%=joinURL %>

<% 
	}
} 
%>

<p>
See: <a href="http://code.google.com/p/bigbluebutton/wiki/MatterhornIntegration">Matterhorn Integration</a>

<%@ include file="demo_footer.jsp"%>

</body>
</html>
