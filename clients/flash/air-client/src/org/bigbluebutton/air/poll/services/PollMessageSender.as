package org.bigbluebutton.air.poll.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class PollMessageSender {
		public var userSession:IUserSession;
		
		public var conferenceParameters:IConferenceParameters;
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
		
		public function votePoll(pollId:String, answerId:int):void {
			var questionId:int = 0; // assume only one question per poll
			var message:Object = {header: {name: "RespondToPollReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID}, body: {requesterId: conferenceParameters.internalUserID, pollId: pollId, questionId: questionId, answerId: answerId}};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
