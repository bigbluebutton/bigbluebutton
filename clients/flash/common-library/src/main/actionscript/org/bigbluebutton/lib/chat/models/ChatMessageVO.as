package org.bigbluebutton.lib.chat.models {
	
	public class ChatMessageVO {
		// The sender
		public var fromUserId:String;
		
		public var fromUsername:String;
		
		public var fromColor:String;
		
		public var fromTime:Number;
		
		public var message:String;
		
		public function toObj():Object {
			var m:Object = new Object();
			m.fromUserId = fromUserId;
			m.fromUsername = fromUsername;
			m.fromColor = fromColor;
			m.fromTime = fromTime;
			m.message = message;
			return m;
		}
	}
}
