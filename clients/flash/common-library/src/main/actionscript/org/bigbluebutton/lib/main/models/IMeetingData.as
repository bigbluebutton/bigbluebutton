package org.bigbluebutton.lib.main.models {
	import org.bigbluebutton.lib.user.models.Users2x;
	import org.bigbluebutton.lib.video.models.Webcams;
	
	public interface IMeetingData {
		function get users():Users2x;
		function get webcams():Webcams;
		function get meetingStatus():MeetingStatus;
	}
}
