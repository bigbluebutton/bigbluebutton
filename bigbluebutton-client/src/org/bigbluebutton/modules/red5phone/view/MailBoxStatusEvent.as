package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class MailBoxStatusEvent extends Event{
		
		public static var MAIBOXSTATUS:String    = "maiboxstatus";
		public var isWaiting:Boolean;
		public var newMessage:String;
		public var oldMessage:String;
		
		
		public function MailBoxStatusEvent(type:String, isWaiting:Boolean, newMessage:String, oldMessage:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.isWaiting       = isWaiting;
			this.newMessage      = newMessage;	
			this.oldMessage      = oldMessage;
		}
		
		public override function clone():Event {
			return new MailBoxStatusEvent(type, isWaiting, newMessage, oldMessage, bubbles, cancelable);
		}

	}
}