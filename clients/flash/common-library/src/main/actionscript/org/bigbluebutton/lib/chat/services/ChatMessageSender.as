package org.bigbluebutton.lib.chat.services {
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.main.models.IConferenceParameters;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.osflash.signals.ISignal;
	
	public class ChatMessageSender {
		private const LOG:String = "ChatMessageSender::";
		
		private var userSession:IUserSession;
		
		private var conferenceParameters:IConferenceParameters;
		
		private var successSendingMessageSignal:ISignal;
		
		private var failureSendingMessageSignal:ISignal;
		
		public function ChatMessageSender(userSession:IUserSession, conferenceParameters:IConferenceParameters, successSendMessageSignal:ISignal, failureSendingMessageSignal:ISignal) {
			this.userSession = userSession;
			this.conferenceParameters = conferenceParameters;
			this.successSendingMessageSignal = successSendMessageSignal;
			this.failureSendingMessageSignal = failureSendingMessageSignal;
		}
		
		public function getPublicChatMessages():void {
			trace(LOG + "Sending [GetChatHistoryReqMsg] to server.");
			var message:Object = {
				header: {name: "GetChatHistoryReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function sendPublicMessage(cm:ChatMessageVO):void {
			trace(LOG + "Sending [SendPublicMessagePubMsg] to server. [" + cm + "]");
			var message:Object = {
				header: {name: "SendPublicMessagePubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {message: cm}
			};
			userSession.mainConnection.sendMessage2x(sendChatSuccessResponse, sendChatFailureResponse, message);
		}
		
		public function sendPrivateMessage(cm:ChatMessageVO):void {
			trace(LOG + "Sending [SendPrivateMessagePubMsg] to server.");
			trace(LOG + "Sending fromUserID [" + cm.fromUserId + "] to toUserID [" + cm.toUserId + "]");
			var message:Object = {
				header: {name: "SendPrivateMessagePubMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {message: cm}
			};
			userSession.mainConnection.sendMessage2x(sendChatSuccessResponse, sendChatFailureResponse, message);
		}
		
		// The default callbacks of userSession.mainconnection.sendMessage
		private function defaultSuccessResponse(result:String):void {
			trace(result);
		};
		
		private function defaultFailureResponse(status:String):void {
			trace(status);
		};
		
		// The callbacks when sending chat messages
		private function sendChatSuccessResponse(result:String):void {
			successSendingMessageSignal.dispatch(result);
		};
		
		private function sendChatFailureResponse(status:String):void {
			failureSendingMessageSignal.dispatch(status);
		};
	}
}
