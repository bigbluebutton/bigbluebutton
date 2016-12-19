package org.bigbluebutton.lib.chat.models {
	
	import mx.collections.ArrayCollection;
	
	public interface IChatMessagesSession {
		function get chats():ArrayCollection;
		function set chats(val:ArrayCollection):void;
		function get publicConversation():Conversation;
		function newPublicMessage(newMessage:ChatMessageVO):void;
		function getPrivateMessages(userId:String, userName:String):Conversation;
		function newPrivateMessage(userId:String, userName:String, newMessage:ChatMessageVO):void;
		function addUserToPrivateMessages(userId:String, userName:String):Conversation;
	}
}
