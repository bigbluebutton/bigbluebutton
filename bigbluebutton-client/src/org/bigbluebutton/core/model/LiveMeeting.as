package org.bigbluebutton.core.model
{
	import org.bigbluebutton.core.model.users.GuestPolicy;
	import org.bigbluebutton.core.model.users.Users2x;
	import org.bigbluebutton.core.model.users.VoiceUsers2x;
		
	public class LiveMeeting
	{
		private static var instance: LiveMeeting = null;
		
		public var me: Me = new Me();
    public var myStatus: MyStatus = new MyStatus();
		public var webcams: Webcams = new Webcams();
		public var voiceUsers: VoiceUsers2x = new VoiceUsers2x();
		public var users: Users2x = new Users2x();
		public var guestsWaitingForApproval: GuestPolicy = new GuestPolicy();
		public var meetingStatus: MeetingStatus = new MeetingStatus();
		public var meeting: Meeting = new Meeting();
		public var config: Config;
		
		public function LiveMeeting(enforcer: LiveMeetingSingletonEnforcer)
		{
			if (enforcer == null){
				throw new Error("There can only be 1 LiveMeeting instance");
			}
		}
		
		public static function inst():LiveMeeting{
			if (instance == null){
				instance = new LiveMeeting(new LiveMeetingSingletonEnforcer());
			}
			return instance;
		}
	}
}

class LiveMeetingSingletonEnforcer{}