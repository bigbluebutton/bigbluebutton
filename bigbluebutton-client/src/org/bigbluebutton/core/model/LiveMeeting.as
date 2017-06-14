package org.bigbluebutton.core.model
{

	public class LiveMeeting
	{
		private static var instance: LiveMeeting = null;
		
		var webcams: Webcams = new Webcams();
		var voiceUsers: VoiceUsers2x = new VoiceUsers2x();
		var users: Users2x = new Users2x();
		
		public function LiveMeeting(enforcer: LiveMeetingSingletonEnforcer)
		{
			if (enforcer == null){
				throw new Error("There can only be 1 LiveMeeting instance");
			}
		}
		
		public static function getInstance():LiveMeeting{
			if (instance == null){
				instance = new LiveMeeting(new LiveMeetingSingletonEnforcer());
			}
			return instance;
		}
	}
}

class LiveMeetingSingletonEnforcer{}