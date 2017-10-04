package org.bigbluebutton.lib.main.models {
	import org.bigbluebutton.lib.user.models.Users2x;
	
	public interface IMeetingData {
		function get users():Users2x;
		function get meetingStatus():MeetingStatus;
	}
}
