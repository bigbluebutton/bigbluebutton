package org.bigbluebutton.air.main.models {
	
	import flash.events.Event;
	
	public class ConnectionFailedEvent extends Event {
		public static const UNKNOWN_REASON:String = "unknownReason";
		
		public static const CONNECTION_FAILED:String = "connectionFailed";
		
		public static const CONNECTION_CLOSED:String = "connectionClosed";
		
		public static const INVALID_APP:String = "invalidApp";
		
		public static const APP_SHUTDOWN:String = "appShutdown";
		
		public static const CONNECTION_REJECTED:String = "connectionRejected";
		
		public static const ASYNC_ERROR:String = "asyncError";
		
		public static const USER_LOGGED_OUT:String = "userHasLoggedOut";
		
		public function ConnectionFailedEvent(type:String) {
			super(type, true, false);
		}
	}
}
