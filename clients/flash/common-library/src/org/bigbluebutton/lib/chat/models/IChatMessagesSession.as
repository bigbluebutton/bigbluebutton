package org.bigbluebutton.lib.chat.models {
	
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.ISignal;
	
	public interface IChatMessagesSession {
		function getPrivateMessages(userId:String, userName:String):PrivateChatMessage;
		function newPrivateMessage(userId:String, userName:String, newMessage:ChatMessageVO):void;
		function addUserToPrivateMessages(userId:String, userName:String):PrivateChatMessage;
		function get publicChat():ChatMessages;
		function set publicChat(value:ChatMessages):void;
		function get privateChats():ArrayCollection;
		function get chatMessageChangeSignal():ISignal;
		function set chatMessageChangeSignal(signal:ISignal):void;
		function get newChatMessageSignal():ISignal;
		function set newChatMessageSignal(signal:ISignal):void;
		function chatMessageDispatchSignal(UserID:String):void;
	}
}
