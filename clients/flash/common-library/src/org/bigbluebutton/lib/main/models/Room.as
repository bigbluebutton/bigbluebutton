package org.bigbluebutton.lib.main.models {
	
	public class Room {
		public var url:String;
		
		public var name:String;
		
		public var timestamp:Date;
		
		public function Room(timestamp:Date, url:String, name:String) {
			this.url = url;
			this.name = name;
			this.timestamp = timestamp;
		}
	}
}
