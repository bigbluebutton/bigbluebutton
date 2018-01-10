package org.bigbluebutton.lib.chat.services {
	
	import org.bigbluebutton.lib.chat.models.ChatMessageVO;
	import org.osflash.signals.ISignal;
	
	public interface IChatMessageService {
		function get sendMessageOnSuccessSignal():ISignal;
		function get sendMessageOnFailureSignal():ISignal;
		function setupMessageSenderReceiver():void;
		function getGroupChats():void;
		function sendChatMessage(message:ChatMessageVO):void;
		function sendWelcomeMessage():void;
	}
}
