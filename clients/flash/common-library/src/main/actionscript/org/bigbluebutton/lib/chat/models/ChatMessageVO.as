package org.bigbluebutton.lib.chat.models {
	
	public class ChatMessageVO {
		// The sender
		public var fromUserId:String;
		
		public var fromUsername:String;
		
		public var fromColor:String;
		
		// Store the UTC time when the message was sent.
		public var fromTime:Number;
		
		// Stores the timezone offset (in minutes) when the message was
		// sent. This is used by the receiver to convert to locale time.
		public var fromTimezoneOffset:Number;
		
		// The receiver. 
		public var toUserId:String = "public_chat_userid";
		
		public var toUsername:String = "public_chat_username";
		
		public var message:String;
		
		public function toObj():Object {
			var m:Object = new Object();
			m.fromUserId = fromUserId;
			m.fromUsername = fromUsername;
			m.fromColor = fromColor;
			m.fromTime = fromTime;
			m.fromTimezoneOffset = fromTimezoneOffset;
			m.message = message;
			m.toUserId = toUserId;
			m.toUsername = toUsername;
			return m;
		}
	}
}
