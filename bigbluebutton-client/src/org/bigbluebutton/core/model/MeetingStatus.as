package org.bigbluebutton.core.model
{
	public class MeetingStatus
	{
		var recordingVoice: Boolean = false;
		
		var audioSettingsInited: Boolean = false;
		var permissionsInited: Boolean = false;
		var permissions = new Permissions();
		var recording: Boolean = false;
		var broadcastingRTMP: Boolean = false;
		var muted: Boolean = false;
		var meetingEnded: Boolean = false;
		var meetingMuted: Boolean = false;
		var guestPolicy: String = "ASK_MODERATOR";
		var guestPolicySetBy: String = null;
	
			
		public function MeetingStatus()
		{
		}
	}
}