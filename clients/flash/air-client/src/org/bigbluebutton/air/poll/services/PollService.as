package org.bigbluebutton.air.poll.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IMeetingData;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class PollService implements IPollService {
		
		[Inject]
		public var conferenceParameters:IConferenceParameters;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var meetingData:IMeetingData;
		
		public var pollMessageSender:PollMessageSender;
		
		public var pollMessageReceiver:PollMessageReceiver;
		
		public function PollService() {
			pollMessageSender = new PollMessageSender();
			pollMessageReceiver = new PollMessageReceiver();
		}
		
		public function setupMessageSenderReceiver():void {
			pollMessageReceiver.meetingData = meetingData;
			pollMessageSender.userSession = userSession;
			pollMessageSender.conferenceParameters = conferenceParameters;
			userSession.mainConnection.addMessageListener(pollMessageReceiver);
		}
		
		public function votePoll(pollId:String, answerId:String):void {
			pollMessageSender.votePoll(pollId, parseInt(answerId));
		}
	}
}
