package org.bigbluebutton.air.user.events {
	import flash.events.Event;
	
	import org.bigbluebutton.air.user.views.models.UserVM;
	
	public class UserItemSelectedEvent extends Event {
		public static var SELECTED:String = "USER_ITEM_SELECTED_EVENT";
		
		public var user:UserVM;
		
		public function UserItemSelectedEvent(u:UserVM) {
			super(SELECTED, true, false);
			
			user = u;
		}
	}
}
