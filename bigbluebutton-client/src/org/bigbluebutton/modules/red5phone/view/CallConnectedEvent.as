package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class CallConnectedEvent extends Event{
		
		public static var CONNECTED:String    = "connected";
		public var publishName:String;
		public var playName:String;
		
		public function CallConnectedEvent(type:String, publishName:String, playName:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.publishName = publishName;
			this.playName = playName;	
		}
		
		public override function clone():Event {
			return new CallConnectedEvent(type, publishName, playName, bubbles, cancelable);
		}

	}
}