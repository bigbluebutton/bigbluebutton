package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class Red5MessageEvent extends Event{
		
		public static var MESSAGE:String    = "message";
		public static var NETSTAUS:String   = "netstatus";
		public static var SIP_REGISTER:String 		= "sip_register";
		public static var CALLSTATE:String  = "callstate";
		public var msgType:String;
		public var message:String;
		
		public function Red5MessageEvent(type:String, msgType:String, message:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.msgType = msgType;
			this.message = message;	
		}
		
		public override function clone():Event {
			return new Red5MessageEvent(type, msgType, message, bubbles, cancelable);
		}
	}
}