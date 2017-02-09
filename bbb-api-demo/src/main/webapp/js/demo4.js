/*
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
	
	Author: Islam El-Ashi <ielashi@gmail.com>
*/

var meetings;	// will hold the meetings data

$(document).ready(function(){
	updateMeetingInfo();	// update the available meeting information as soon as the page is loaded.
	setInterval("updateMeetingInfo()", 15000);	// update the meeting information every 15 seconds
});


// For each active meeting, create a table listing the participants and insert it into the page.
function createMeetings() {
	var nOfMeetings = 0;
	if (meetings.meeting) {
		for (var i in meetings.meeting) {
			
			// this variable is to work around the JSON nuance of having a variable instead of an array of one member.
			// if we detect there is more than one meeting use the array, otherwise use the variable
			var meeting = (meetings.meeting[i].attendees != null) ? meetings.meeting[i] : meetings.meeting;
			
			createMeetingTable(meeting);
			
			if (meeting.participantCount != "0") nOfMeetings++;
			
			// this is also to work around the JSON nuance, if we previously detected that there is only
			// one element (i.e. a variable) then we shouldn't loop again.
			if (meeting == meetings.meeting) break;
		}
	}
	
	// if there are no meetings then display a message to the user.
	if (nOfMeetings == 0) { 
		$("#no_meetings").text("No meetings currently running.");
		$("#meetings").text('');
	}
	else 
		$("#no_meetings").text('');
}

// creates div tags for each meeting to be able to insert the meeting table into the DOM afterwards
function initializeDivTags() {
	if (meetings.meeting) {
		var meetingID;
		var meeting;
		var encodedMeetingID;
		for (var i in meetings.meeting) {
			meeting = (meetings.meeting[i].attendees != null) ? meetings.meeting[i] : meetings.meeting;
			meetingID = meeting.meetingID;
			encodedMeeting = encode(meetingID);
			
			if ($("#" + encodedMeeting).length == 0) {
				// assign the div tag an id unique to each meeting
				// the id assigned is the encoded value of the meeting id, the encoding is to avoid
				// special characters and spaces in the id
				$("#meetings").append('<div id="' + encodedMeeting + '" class="hiddenDiv"></div>');
			}
			
			if (meeting == meetings.meeting) break;
		}
	}
}

// call the demo4 helper page to fetch the updated data, this is executed every 15 seconds.
function updateMeetingInfo() {
	$.ajax({
    	type: "GET",
		url: 'demo4_helper.jsp?getxml=true',
		dataType: "text/xml",
		cache: false,
		success: function(xml) {
			meetings = $.xml2json(xml);
			initializeDivTags();
			createMeetings();
		},
		error: function() {
			$("#no_meetings").text("Failed to connect to API.");
			$("#meetings").text("");
		}
	});
}

function getMeetingsInfoURL(meetingID, password, checksum) {
	return '../api/getMeetingInfo?meetingID=' + meetingID + '&password=' + password + '&checksum=' + checksum;
}

function createMeetingTable(meeting) {	
	
	var form = '<th><FORM NAME="form1" METHOD="GET"><input type="hidden" name="meetingID" value="' + meeting.meetingID + '"/>';
	form += '<input type="hidden" name="moderatorPW" value="' + meeting.moderatorPW + '"/>';
	form += '<INPUT TYPE=hidden NAME=action VALUE="end">';
	form += '<input type="submit" value="End"/></FORM>';
	form += '</th>';
	
	var tableContent = '<table name="' + meeting.meetingID + '" class="hor-minimalist-b" cellspacing="0" summary="The current participants in a meeting"><caption>' + meeting.meetingName + '<caption><tr><th scope="col" abbr="Participants">Participants</th><th scope="col" abbr="Name">Name</th><th scope="col" abbr="Role">Role</th>';
	
	//uncomment below to add the ability to end meetings in the activity monitor
	//tableContent += form;
	
	tableContent += '</tr>';
	
	var encodedMeetingID = encode(meeting.meetingID);
	var tableRowId;
	var newRows = new Array();
	var numberOfRows = 0;
	
	if (meeting.attendees.attendee) {
		for (var i in meeting.attendees.attendee) {
			var attendee = (meeting.attendees.attendee[i].userID != null) ? meeting.attendees.attendee[i] : meeting.attendees.attendee;
			tableRowId = encodedMeetingID + '_' + attendee.userID;
			tableContent += '<tr id="' + tableRowId + '"><td>' + attendee.userID + '<td>' + attendee.fullName + '</td><td>' + attendee.role + '</td></tr>';

			// if there is a new row to be added, then add to the new rows array to display it with a flash effect.
			if ($("#" + tableRowId).length == 0) {
				newRows[newRows.length] = tableRowId;
			}
			numberOfRows++;
			
			if (attendee == meeting.attendees.attendee) break;
		}
	}
	
	tableContent += '</table>';

	if (numberOfRows > 0) {
		$("#" + encodedMeetingID).html(tableContent);
		$("#" + encodedMeetingID).show("fast");
	}
	else {
		$("#" + encodedMeetingID).hide("fast");
	}

	for (var i = 0; i < newRows.length; i++) {
		$("#" + newRows[i]).effect("highlight", {}, 3000);
	}
}

// the encoding hashes the string to an md5, which ensures - to a great extent - that the encoded string will be 
// 1. unique per the original string
// 2. has no spaces and/or special characters
function encode(string) {
	return hex_md5(string);
}

