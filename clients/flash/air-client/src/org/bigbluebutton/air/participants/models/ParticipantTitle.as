package org.bigbluebutton.air.participants.models {
	
	[Bindable]
	public class ParticipantTitle {
		
		public static const CHAT:int = 0;
		
		public static const USER:int = 1;
		
		public var name:String;
		
		public var type:int;
		
		public function ParticipantTitle(name:String, type:int) {
			this.name = name;
			this.type = type;
		}
	}
}
