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

Author: Fred Dixon <ffdixon@bigbluebutton.org>

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
	<title>Mconf-Live Demo</title>
	<link rel="stylesheet" href="css/mconf-bootstrap.min.css" type="text/css" />
	<link rel="stylesheet" type="text/css" href="css/ui.jqgrid.css" />
	<link rel="stylesheet" type="text/css" href="css/redmond/jquery-ui-redmond.css" />
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script type="text/javascript" src="js/jquery-ui.js"></script>
	<script type="text/javascript" src="js/jquery.validate.min.js"></script>
	<script src="js/grid.locale-en.js" type="text/javascript"></script>
	<script src="js/jquery.jqGrid.min.js" type="text/javascript"></script>
	<script src="js/jquery.xml2json.js" type="text/javascript"></script>
	<style type="text/css">
	 .ui-jqgrid{
		font-size:0.7em;
		margin-left: auto;
		margin-right: auto;
	}
	label.error{
		float: none;
		color: red;
		padding-left: .5em;
		vertical-align: top;
		width:200px;
		text-align:left;
	}
	</style>
</head>
<body>

<%@ include file="bbb_api.jsp"%>

<%

//
// We're going to define some sample courses (meetings) below.  This API exampe shows how you can create a login page for a course.
// The password below are not available to users as they are compiled on the server.
//

HashMap<String, HashMap> allMeetings = new HashMap<String, HashMap>();
HashMap<String, String> meeting;

// String welcome = "<br>Welcome to %%CONFNAME%%!<br><br>For help see our <a href=\"event:http://www.bigbluebutton.org/content/videos\"><u>tutorial videos</u></a>.<br><br>To join the voice bridge for this meeting:<br>  (1) click the headset icon in the upper-left, or<br>  (2) dial xxx-xxx-xxxx (toll free:1-xxx-xxx-xxxx) and enter conference ID: %%CONFNUM%%.<br><br>";

String welcome = "<br>Welcome to <b>%%CONFNAME%%</b>!<br><br>In order to speak, click on the headset icon.";

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 1", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72013");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 2", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72014");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 3", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72015");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = new HashMap<String, String>();
allMeetings.put( "Test room 4", meeting );	// The title that will appear in the drop-down menu
	meeting.put("welcomeMsg", 	welcome);			// The welcome mesage
	meeting.put("moderatorPW", 	"prof123");			// The password for moderator
	meeting.put("viewerPW", 	"student123");			// The password for viewer
	meeting.put("voiceBridge", 	"72016");			// The extension number for the voice bridge (use if connected to phone system)
	meeting.put("logoutURL", 	"/demo/demo_mconf.jsp");  // The logout URL (use if you want to return to your pages)

meeting = null;

Iterator<String> meetingIterator = new TreeSet<String>(allMeetings.keySet()).iterator();

if (request.getParameterMap().isEmpty()) {
		//
		// Assume we want to join a course
		//
	%>

<div style="width: 400px; margin: auto auto; ">
	<div style="text-align: center; ">
		<img src="images/mconf.png" style="
			width: 300px;
			height: auto;
			display: block; margin-left: auto; margin-right: auto;
		">
	</div>

	<span style="text-align: center; ">
		<h3>Join a test room</h3>
	</span>

	<FORM NAME="form1" METHOD="GET">
	<table cellpadding="3" cellspacing="5">
		<tbody>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Room:</td>
				<td>
					&nbsp;
				</td>
				<td style="text-align: left ">
				<select name="meetingID" onchange="onChangeMeeting(this.value);">
				<%
					String key;
					while (meetingIterator.hasNext()) {
						key = meetingIterator.next();
						out.println("<option value=\"" + key + "\">" + key + "</option>");
					}
				%>
				</select><span id="label_meeting_running" hidden><i>&nbsp;Running!</i></span>

				</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Full&nbsp;Name:</td>
				<td style="width: 5px; ">
					&nbsp;</td>
				<td style="text-align: left ">
					<input type="text" autofocus required name="username" /></td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Role:</td>
				<td>
					&nbsp;</td>
				<td>
					<input type="radio" name="password" value="prof123" text="Moderator" checked>Moderator</input>
					<input type="radio" name="password" value="student123">Viewer</input>
				</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td style="text-align: right; ">
					Guest:</td>
				<td>
					&nbsp;</td>
				<td>
					<input id="check_guest" type="checkbox" name="guest" value="guest" />&nbsp;&nbsp;&nbsp;(authorization required)</td>
			</tr>
			<tr>
				<td>
					&nbsp;</td>
				<td>
					&nbsp;</td>
				<td>
					&nbsp;</td>
				<td>
					<input type="submit" value="Join" style="width: 220px; "></td>
			</tr>
		</tbody>
	</table>
	<INPUT TYPE=hidden NAME=action VALUE="create">
	</FORM>
</div>

<div style="text-align: center; ">
	<h3>Recorded Sessions</h3>

	<select id="actionscmb" name="actions" onchange="recordedAction(this.value);">
		<option value="novalue" selected>Actions...</option>
		<option value="publish">Publish</option>
		<option value="unpublish">Unpublish</option>
		<option value="delete">Delete</option>
	</select>
	<table id="recordgrid"></table>
	<div id="pager"></div>
	<p>Note: New recordings will appear in the above list after processing.  Refresh your browser to update the list.</p>
	<script>
	function onChangeMeeting(meetingID){
		isRunningMeeting(meetingID);
	}
	function recordedAction(action){
		if(action=="novalue"){
			return;
		}

		var s = jQuery("#recordgrid").jqGrid('getGridParam','selarrrow');
		if(s.length==0){
			alert("Select at least one row");
			$("#actionscmb").val("novalue");
			return;
		}
		var recordid="";
		for(var i=0;i<s.length;i++){
			var d = jQuery("#recordgrid").jqGrid('getRowData',s[i]);
			recordid+=d.id;
			if(i!=s.length-1)
				recordid+=",";
		}
		if(action=="delete"){
			var answer = confirm ("Are you sure to delete the selected recordings?");
			if (answer)
				sendRecordingAction(recordid,action);
			else{
				$("#actionscmb").val("novalue");
				return;
			}
		}else{
			sendRecordingAction(recordid,action);
		}
		$("#actionscmb").val("novalue");
	}

	function sendRecordingAction(recordID,action){
		$.ajax({
			type: "GET",
			url: 'demo10_helper.jsp',
			data: "command="+action+"&recordID="+recordID,
			dataType: "xml",
			cache: false,
			success: function(xml) {
				window.location.reload(true);
				$("#recordgrid").trigger("reloadGrid");
			},
			error: function() {
				alert("Failed to connect to API.");
			}
		});
	}

	function isRunningMeeting(meetingID) {
		$.ajax({
			type: "GET",
			url: 'demo10_helper.jsp',
			data: "command=isRunning&meetingID="+meetingID,
			dataType: "xml",
			cache: false,
			success: function(xml) {
				response = $.xml2json(xml);
				if(response.running=="true"){
					$("#check_record").attr("readonly","readonly");
					$("#check_record").attr("disabled","disabled");
					$("#label_meeting_running").removeAttr("hidden");
					$("#meta_description").val("An active session exists for "+meetingID+". This session is being recorded.");
					$("#meta_description").attr("readonly","readonly");
					$("#meta_description").attr("disabled","disabled");
				}else{
					$("#check_record").removeAttr("readonly");
					$("#check_record").removeAttr("disabled");
					$("#label_meeting_running").attr("hidden","");
					$("#meta_description").val("");
					$("#meta_description").removeAttr("readonly");
					$("#meta_description").removeAttr("disabled");
				}

			},
			error: function() {
				alert("Failed to connect to API.");
			}
		});
	}
	var meetingID="Test room 1,Test room 2,Test room 3,Test room 4";
	$(document).ready(function(){
		isRunningMeeting("Test room 1");
		$("#formcreate").validate();
		$("#meetingID option[value='Test room 1']").attr("selected","selected");
		jQuery("#recordgrid").jqGrid({
			url: "demo10_helper.jsp?command=getRecords&meetingID="+meetingID,
			datatype: "xml",
			height: 150,
			loadonce: true,
			sortable: true,
			colNames:['Id','Room','Date Recorded', 'Published', 'Playback', 'Length'],
			colModel:[
				{name:'id',index:'id', width:50, hidden:true, xmlmap: "recordID"},
				{name:'course',index:'course', width:150, xmlmap: "name", sortable:true},
				{name:'daterecorded',index:'daterecorded', width:200, xmlmap: "startTime", sortable: true, sorttype: "datetime", datefmt: "d-m-y h:i:s"},
				{name:'published',index:'published', width:80, xmlmap: "published", sortable:true },
				{name:'playback',index:'playback', width:150, xmlmap:"playback", sortable:false},
				{name:'length',index:'length', width:80, xmlmap:"length", sortable:true}
			],
			xmlReader: {
				root : "recordings",
				row: "recording",
				repeatitems:false,
				id: "recordID"
			},
			pager : '#pager',
			emptyrecords: "Nothing to display",
			multiselect: true,
			caption: "Recorded Sessions",
			loadComplete: function(){
				$("#recordgrid").trigger("reloadGrid");
			}
		});
	});
	</script>
</div>

<%
	} else if (request.getParameter("action").equals("create")) {
		//
		// Got an action=create
		//

		String username = request.getParameter("username");
		String meetingID = request.getParameter("meetingID");
		String password = request.getParameter("password");

		meeting = allMeetings.get( meetingID );

		String welcomeMsg = meeting.get( "welcomeMsg" );
		String logoutURL = meeting.get( "logoutURL" );
		Integer voiceBridge = Integer.parseInt( meeting.get( "voiceBridge" ).trim() );

		String viewerPW = meeting.get( "viewerPW" );
		String moderatorPW = meeting.get( "moderatorPW" );
		Boolean guest = request.getParameter("guest") != null;
		Boolean record = request.getParameter("record") != null;

		//
		// Check if we have a valid password
		//
		if ( ! password.equals(viewerPW) && ! password.equals(moderatorPW) ) {
%>

Invalid Password, please <a href="javascript:history.go(-1)">try again</a>.

<%
			return;
		}

		// create the meeting
		String base_url_create = BigBlueButtonURL + "api/create?";
		String base_url_join = BigBlueButtonURL + "api/join?";
		String welcome_param = "&welcome=" + urlEncode(welcomeMsg);
		String voiceBridge_param = "&voiceBridge=" + voiceBridge;
		String moderator_password_param = "&moderatorPW=" + urlEncode(moderatorPW);
		String attendee_password_param = "&attendeePW=" + urlEncode(viewerPW);
		String logoutURL_param = "&logoutURL=" + urlEncode(logoutURL);

		String create_parameters = "name=" + urlEncode(meetingID)
			+ "&meetingID=" + urlEncode(meetingID) + welcome_param + voiceBridge_param
			+ moderator_password_param + attendee_password_param + logoutURL_param
			+ "&record=true";

		// Attempt to create a meeting using meetingID
		Document doc = null;
		try {
			String url = base_url_create + create_parameters
				+ "&checksum="
				+ checksum("create" + create_parameters + salt);
			doc = parseXml( postURL( url, "" ) );
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (! doc.getElementsByTagName("returncode").item(0).getTextContent()
				.trim().equals("SUCCESS")) {
%>

Error: createMeeting() failed
<p /><%=meetingID%>

<%
			return;
		}

		//
		// Looks good, now return a URL to join that meeting
		//

		String join_parameters = "meetingID=" + urlEncode(meetingID)
			+ "&fullName=" + urlEncode(username) + "&password=" + urlEncode(password) + "&guest="+ urlEncode(guest.toString());
		String joinURL = base_url_join + join_parameters + "&checksum="
			+ checksum("join" + join_parameters + salt);
%>

<script language="javascript" type="text/javascript">
	// http://stackoverflow.com/a/11381730
	mobileAndTabletcheck = function() {
		var check = false;
		(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}

	processJoinUrl = function(url) {
		if (mobileAndTabletcheck()) {
			return url.replace("http://", "bigbluebutton://");
		} else {
			return url;
		}
	}

	window.location.href = processJoinUrl("<%=joinURL%>");
</script>

<%
	}
%>

</body>
</html>


