package org.bigbluebutton.air.main.models {
	import org.bigbluebutton.air.poll.models.Polls;
	import org.bigbluebutton.air.user.models.Users2x;
	import org.bigbluebutton.air.video.models.Webcams;
	import org.bigbluebutton.air.voice.models.VoiceUsers;
	
	public interface IMeetingData {
		function get users():Users2x;
		function get polls():Polls;
		function get voiceUsers():VoiceUsers;
		function get webcams():Webcams;
		function get meetingStatus():MeetingStatus;
	}
}
