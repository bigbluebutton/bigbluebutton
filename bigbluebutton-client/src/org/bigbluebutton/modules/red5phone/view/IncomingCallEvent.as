package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class IncomingCallEvent extends Event{
	
		public static var INCOMING:String    = "incoming";
		public var source:String;
		public var sourceName:String;
		public var destination:String;
		public var destinationName:String;
		
		public function IncomingCallEvent(type:String, source:String, sourceName:String, destination:String, destinationName:String , bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.source          = source;
			this.sourceName      = sourceName;	
			this.destination     = destination;
			this.destinationName = destinationName;	
		}
		
		public override function clone():Event {
			return new IncomingCallEvent(type, source, sourceName, destination, destinationName, bubbles, cancelable);
		}

	}
}