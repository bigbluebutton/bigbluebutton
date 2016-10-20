package org.bigbluebutton.lib.chat.services {
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.osflash.signals.ISignal;
	import org.osflash.signals.Signal;
	
	public class ChatMessageSender {
		private const LOG:String = "ChatMessageSender::";
		
		public var userSession:IUserSession;
		
		private var successSendingMessageSignal:ISignal;
		
		private var failureSendingMessageSignal:ISignal;
		
		public function ChatMessageSender(userSession:IUserSession, successSendMessageSignal:ISignal, failureSendingMessageSignal:ISignal) {
			this.userSession = userSession;
			this.successSendingMessageSignal = successSendMessageSignal;
			this.failureSendingMessageSignal = failureSendingMessageSignal;
		}
		
		public function getPublicChatMessages():void {
			trace(LOG + "Sending [chat.getPublicMessages] to server.");
			userSession.mainConnection.sendMessage("chat.sendPublicChatHistory", function(result:String):void { // On successful result
				publicChatMessagesOnSuccessSignal.dispatch(result);
			}, function(status:String):void { // status - On error occurred
				publicChatMessagesOnFailureSignal.dispatch(status);
			});
		}
		
		public function sendPublicMessage(message:ChatMessageVO):void {
			trace(LOG + "Sending [chat.sendPublicMessage] to server. [" + message.message + "]");
			userSession.mainConnection.sendMessage("chat.sendPublicMessage", function(result:String):void { // On successful result
				successSendingMessageSignal.dispatch(result);
			}, function(status:String):void { // status - On error occurred
				failureSendingMessageSignal.dispatch(status);
			}, message.toObj());
		}
		
		public function sendPrivateMessage(message:ChatMessageVO):void {
			trace(LOG + "Sending [chat.sendPrivateMessage] to server.");
			trace(LOG + "Sending fromUserID [" + message.fromUserID + "] to toUserID [" + message.toUserID + "]");
			userSession.mainConnection.sendMessage("chat.sendPrivateMessage", function(result:String):void { // On successful result
				successSendingMessageSignal.dispatch(result);
			}, function(status:String):void { // status - On error occurred
				failureSendingMessageSignal.dispatch(status);
			}, message.toObj());
		}
		
		private var _publicChatMessagesOnSuccessSignal:Signal = new Signal();
		
		private var _publicChatMessagesOnFailureSignal:Signal = new Signal();
		
		public function get publicChatMessagesOnSuccessSignal():Signal {
			return _publicChatMessagesOnSuccessSignal;
		}
		
		public function get publicChatMessagesOnFailureSignal():Signal {
			return _publicChatMessagesOnFailureSignal;
		}
	}
}
