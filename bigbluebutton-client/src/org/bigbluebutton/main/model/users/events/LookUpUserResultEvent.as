package org.bigbluebutton.main.model.users.events {
	import flash.events.Event;
	
	public class LookUpUserResultEvent extends Event {
		public static const SHOW_WINDOW:String = "SHOW USER LOOKUP WINDOW";
		
		public var userInfo:Array
		
		public function LookUpUserResultEvent(userInfo:Array) {
			super(SHOW_WINDOW, false, false);
			
			this.userInfo = userInfo;
		}
	}
}