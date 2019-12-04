package org.bigbluebutton.air.chat.services {
	
	import org.bigbluebutton.air.chat.models.ChatMessageVO;
	import org.osflash.signals.ISignal;
	
	public interface IChatMessageService {
		function get sendMessageOnSuccessSignal():ISignal;
		function get sendMessageOnFailureSignal():ISignal;
		function setupMessageSenderReceiver():void;
		function getGroupChats():void;
		function getGroupChatHistory(chatId:String):void;
		function createGroupChat(name:String, isPublic:Boolean, users:Array):void;
		function sendChatMessage(chatId:String, message:ChatMessageVO):void;
		function sendWelcomeMessage():void;
	}
}
