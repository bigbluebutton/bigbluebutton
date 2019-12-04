package org.bigbluebutton.air.voice.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class VoiceService implements IVoiceService {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		private var voiceMessageSender:VoiceMessageSender;
		
		private var voiceMessageReceiver:VoiceMessageReceiver;
		
		public function VoiceService() {
			voiceMessageSender = new VoiceMessageSender;
			voiceMessageReceiver = new VoiceMessageReceiver;
		}
		
		public function setupMessageSenderReceiver():void {
			voiceMessageReceiver.meetingData = meetingData;
			voiceMessageReceiver.conferenceParameters = conferenceParameters;
			voiceMessageSender.userSession = userSession;
			voiceMessageSender.conferenceParameters = conferenceParameters;
			userSession.mainConnection.addMessageListener(voiceMessageReceiver);
		}
		
		public function mute(userId:String):void {
			voiceMessageSender.muteUnmuteUser(userId, true);
		}
		
		public function unmute(userId:String):void {
			voiceMessageSender.muteUnmuteUser(userId, false);
		}
	}
}
