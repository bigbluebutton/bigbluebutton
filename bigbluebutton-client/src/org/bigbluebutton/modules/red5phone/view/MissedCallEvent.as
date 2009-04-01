package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class MissedCallEvent extends Event{
		
		public static var CALLMISSED:String    = "callmised";
		public var message:String;
		
		public function MissedCallEvent(type:String, message:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.message = message;
		}
		
		public override function clone():Event {
			return new MissedCallEvent(type, message, bubbles, cancelable);
		}
	}
}