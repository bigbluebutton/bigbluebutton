package org.bigbluebutton.modules.listeners.events
{
	import flash.events.Event;

	public class ListenersCommand extends Event
	{
		public static const MUTE_ALL:String = "MUTE_ALL";
		public static const UNMUTE_ALL:String = "UNMUTE_ALL";
		
		public static const EJECT_USER:String = "EJECT_USER";
		public static const LOCK_MUTE_USER:String = "LOCK_MUTE_USER";
		public static const MUTE_USER:String = "MUTE_USER";
		public static const UNMUTE_USER:String = "UNMUTE_USER";
		
		public var userid:int;
		public var mute:Boolean;
		public var lock:Boolean;
		
		public function ListenersCommand(type:String)
		{
			super(type, true, false);
		}
	}
}