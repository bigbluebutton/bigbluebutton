package org.bigbluebutton.air.chat.models {
	
	import mx.collections.ArrayCollection;
	
	import org.osflash.signals.Signal;
	
	public interface IChatMessagesSession {
		function get chats():ArrayCollection;
		function get groupChatChangeSignal():Signal;
		function getGroupByChatId(chatId:String):GroupChat;
		function getGroupByUserId(userId:String):GroupChat;
		function addGroupChatsList(chats:Array):void;
		function addMessageHistory(chatId:String, messages:Array):void;
		function clearPublicChat(chatId:String):void;
		function addChatMessage(chatId:String, cm:ChatMessageVO):void;
		function addGroupChat(groupChat:GroupChatVO):void;
	}
}
