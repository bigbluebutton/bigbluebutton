package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class CallDisconnectedEvent extends Event{
		
		public static var DISCONNECTED:String    = "disconnected";
		public var message:String;
		
		public function CallDisconnectedEvent(type:String, message:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.message = message;
		}
		
		public override function clone():Event {
			return new CallDisconnectedEvent(type, message, bubbles, cancelable);
		}

	}
}