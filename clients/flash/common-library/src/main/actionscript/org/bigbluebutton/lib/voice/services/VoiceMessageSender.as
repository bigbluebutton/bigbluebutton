package org.bigbluebutton.lib.voice.services {
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	
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
		
		public function muteUnmuteUser(userid:String, mute:Boolean):void {
			trace("VoiceMessageSender::muteUnmuteUser() -- Sending [MuteUserCmdMsg] message to server with message [userId:" + userid + ", mute:" + mute + "]");
			var message:Object = {header: {name: "MuteUserCmdMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID}, body: {userId: userid, mutedBy: conferenceParameters.internalUserID, mute: mute}};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
	}
}
