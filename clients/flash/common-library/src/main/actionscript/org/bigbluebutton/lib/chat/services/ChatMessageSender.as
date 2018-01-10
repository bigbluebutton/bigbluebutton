package org.bigbluebutton.lib.chat.services {
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.chat.utils.ChatUtil;
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
		
		public function getGroupChats():void {
			trace(LOG + "Sending [GetGroupChatsReqMsg] to server.");
			var message:Object = {
				header: {name: "GetGroupChatsReqMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {requesterId: conferenceParameters.internalUserID}
			};
			userSession.mainConnection.sendMessage2x(defaultSuccessResponse, defaultFailureResponse, message);
		}
		
		public function sendChatMessage(chatId: String, cm:ChatMessageVO):void {
			trace("Sending [SendGroupChatMessageMsg] to server. [{0}]", [cm.message]);
			var sender:Object = {id: cm.fromUserId, name: cm.fromUsername};
			var corrId: String = ChatUtil.genCorrelationId(conferenceParameters.internalUserID);
			
			var msgFromUser:Object = {correlationId: corrId, sender: sender, color: cm.fromColor, message: cm.message};
			
			var message:Object = {
				header: {name: "SendGroupChatMessageMsg", meetingId: conferenceParameters.meetingID, userId: conferenceParameters.internalUserID},
				body: {chatId: chatId, msg: msgFromUser}
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
