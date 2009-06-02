package org.bigbluebutton.modules.red5phone.view {
	
	import flash.events.Event;
	
	public class MailBoxCountEvent extends Event{
		
		public static var MAIBOXCOUNT:String    = "maiboxcount";
		public var newMessage:String;
		public var oldMessage:String;
		
		
		public function MailBoxCountEvent(type:String, newMessage:String, oldMessage:String, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.newMessage      = newMessage;	
			this.oldMessage      = oldMessage;
		}
		
		public override function clone():Event {
			return new MailBoxCountEvent(type, newMessage, oldMessage, bubbles, cancelable);
		}

	}
}