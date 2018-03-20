package org.bigbluebutton.air.participants.models {
	
	[Bindable]
	public class ParticipantTitle {
		
		public static const CHAT:String = "chat";
		
		public static const USER:String = "user";
		
		public var name:String;
		
		public var type:String;
		
		public function ParticipantTitle(name:String, type:String) {
			this.name = name;
			this.type = type;
		}
	}
}
