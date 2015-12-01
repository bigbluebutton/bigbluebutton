package org.bigbluebutton.air.users.views.participants.guests {
	
	import flash.events.Event;
	
	public class GuestResponseEvent extends Event {
		public static const GUEST_RESPONSE:String = "guestResponse";
		
		public var allow:Boolean;
		
		public var guestID:String;
		
		public function GuestResponseEvent(type:String, guestID:String, allow:Boolean, bubbles:Boolean = false, cancelable:Boolean = false) {
			super(type, bubbles, cancelable);
			this.allow = allow;
			this.guestID = guestID;
		}
	}
}
