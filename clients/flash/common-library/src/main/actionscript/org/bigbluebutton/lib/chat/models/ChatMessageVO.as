package org.bigbluebutton.lib.chat.models {
	
	public class ChatMessageVO {
		// The type of chat (PUBLIC or PRIVATE)
		public var chatType:String;
		
		// The sender
		public var fromUserID:String;
		
		public var fromUsername:String;
		
		public var fromColor:String;
		
		// Store the UTC time when the message was sent.
		public var fromTime:Number;
		
		// Stores the timezone offset (in minutes) when the message was
		// sent. This is used by the receiver to convert to locale time.
		public var fromTimezoneOffset:Number;
		
		public var fromLang:String;
		
		// The receiver. 
		public var toUserID:String = "public_chat_userid";
		
		public var toUsername:String = "public_chat_username";
		
		public var message:String;
		
		public function toObj():Object {
			var m:Object = new Object();
			m.chatType = chatType;
			m.fromUserID = fromUserID;
			m.fromUsername = fromUsername;
			m.fromColor = fromColor;
			m.fromTime = fromTime;
			m.fromTimezoneOffset = fromTimezoneOffset;
			m.fromLang = fromLang;
			m.message = message;
			m.toUserID = toUserID;
			m.toUsername = toUsername;
			return m;
		}
	}
}
