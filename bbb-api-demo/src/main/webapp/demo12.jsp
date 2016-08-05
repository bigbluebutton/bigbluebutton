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
            <legend>Demo Meeting</legend>
            <ul>
                <li>
                    <label for="username1">Your Name:</label>
                    <input id="username1" required name="username1" type="text" />	
                </li>
            </ul>
        </fieldset>

        <fieldset>
            <legend>config.xml (client configuration)</legend>

		<label for="skin">Skin:</label>
			<select id="skin" name="Skin">
			  <option value="BBBDefault">Default</option>
			  <option value="BBBBlack">Black</option>
			</select><br><br>			
		

		<label for="layout" >Layout:</label>
	                <select id="layout" name="Layout">
        	            <option value="bbb.layout.name.defaultlayout" selected="selected">Default</option>
                	    <option value="bbb.layout.name.videochat">Video Chat</option>
	                    <option value="bbb.layout.name.webcamsfocus">Meeting</option>
			    <option value="bbb.layout.name.presentfocus">Webinar</option>
	                </select><br><br>

		<label for="videomodule">Auto start webcam:</label>
			<select id="videomodule" name="VideoModule">
			  <option value="false">No</option>
			  <option value="true">Yes</option>
			  <option value="disable">Disable</option>
			</select><br><br>			

		<label for="autostartaudio">Auto start audio:</label>
			<select id="autostartaudio" name="PhoneModule">
			  <option value="true">Yes</option>
			  <option value="false">No</option>
			  <option value="disable">Disable</option>
			</select><br><br>

		<label for="languagebutton">Show language button:</label>
			<select id="languagebutton" name="LanguageButton">
			  <option value="true">Yes</option>
			  <option value="false">No</option>
			</select><br><br>

		<label for="helpbutton">Show help button:</label>
			<select id="helpbutton" name="HelpButton">
			  <option value="true">Yes</option>
			  <option value="false">No</option>
			</select><br><br>

		<label for="helplurl">Help URL:</label>
			<input type="text" id="helpurl" name="HelpUrl" value="http://<%=  getBigBlueButtonIP() %>/help.html"/>

        </fieldset>
		
		<input type="submit" value="Create" >
		<input type="hidden" name="action" value="create" />
    </form>
	
<%
	} else if (request.getParameter("action").equals("create")) {
		String confname = "Demo Meeting";
		String username = request.getParameter("username1");

	Document doc = null;
	try {
        	 doc = parseXml( getDefaultConfigXML() );
	} catch (Exception e) {
        	e.printStackTrace();
        }

	// Get request parameters to edit config.xml

	String param_Skin = request.getParameter("Skin");
	String param_Layout = request.getParameter("Layout");
	String param_VideoModule = request.getParameter("VideoModule");
	String param_PhoneModule = request.getParameter("PhoneModule");
	String param_LanguageButton = request.getParameter("LanguageButton");
	String param_HelpButton = request.getParameter("HelpButton");
	String param_HelpUrl = request.getParameter("HelpUrl");


	Node firstChild = doc.getFirstChild();

	//Set skin
	Element skinElement = (Element)  doc.getElementsByTagName("skinning").item(0);
	skinElement.setAttribute("url", "https://" + getBigBlueButtonIP() + "/client/branding/css/" + param_Skin + ".css.swf" );

	//Set layout
	Element layoutElement = (Element)  doc.getElementsByTagName("layout").item(0);
	layoutElement.setAttribute("defaultLayout", param_Layout );

	//Set auto start webcam
	Element webcamElement = getElementWithAttribute(firstChild, "name", "VideoconfModule");
	if(param_VideoModule.equals("disable")){
		webcamElement.getParentNode().removeChild(webcamElement);
		//This is not returning null, removing the next 2 lines fixes the issue with demo12.jsp
		//Element videodockModule = getElementWithAttribute(firstChild, "name", "VideodockModule");
		//videodockModule.getParentNode().removeChild(videodockModule);
	}else{
	        webcamElement.setAttribute("autoStart", param_VideoModule);		
	}
	
	//Set auto join audio or disable it
	Element audioElement = getElementWithAttribute(firstChild, "name", "PhoneModule");
	if (param_PhoneModule.equals("disable")){
		audioElement.getParentNode().removeChild(audioElement);
	}else{
	        audioElement.setAttribute("autoJoin", param_PhoneModule);
	}

	//Set language button
	Element languageElement =  (Element)  doc.getElementsByTagName("language").item(0);
        languageElement.setAttribute("userSelectionEnabled", param_LanguageButton);
	
	//Set help button. It is in the layout element
	layoutElement.setAttribute("showHelpButton", param_HelpButton ); 

	//Set help url
	Element helpElement =  (Element)  doc.getElementsByTagName("help").item(0);
	String helpUrl = helpElement.getAttribute("url");

	//Create new config.xml
	TransformerFactory tf = TransformerFactory.newInstance();
        Transformer transformer = tf.newTransformer();
        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        StringWriter writer = new StringWriter();
        transformer.transform(new DOMSource(doc), new StreamResult(writer));
        String configXML = writer.getBuffer().toString().replaceAll("\n|\r", "");

		//
		// This is the URL for to join the meeting as moderator
		//
		String url = BigBlueButtonURL.replace("bigbluebutton/","demo/");
		String joinURL = getJoinURLwithDynamicConfigXML(username, confname, configXML);

		if (joinURL.startsWith("http://") || joinURL.startsWith("https://")) { 
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
