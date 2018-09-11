package org.bigbluebutton.air.voice.services {
	import org.bigbluebutton.air.main.models.IConferenceParameters;
	import org.bigbluebutton.air.main.models.IUserSession;
	
	public class VoiceMessageSender {
		public var userSession:IUserSession;
		
		public var conferenceParameters:IConferenceParameters;
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private var defaultSuccessResponse:Function = function(result:String):void {
			trace(result);
		};
		
		private var defaultFailureResponse:Function = function(status:String):void {
			trace(status);
		};
		
		public function VoiceMessageSender() {
		}
		
		public function muteUnmuteUser(userId:String, mute:Boolean):void {
			trace("VoiceMessageSender::muteUnmuteUser() -- Sending [MuteUserCmdMsg] message to server with message [userId:" + userId + ", mute:" + mute + "]");
			var message:Object = {header: {name: "MuteUserCmdMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID}, body: {userId: userId, mutedBy: conferenceParameters.internalUserID, mute: mute}};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
