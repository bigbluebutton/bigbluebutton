package org.bigbluebutton.modules.listeners.events
{
	import flash.events.Event;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.modules.listeners.business.vo.Listeners;

	public class ListenersEvent extends Event
	{
		public static const FIRST_LISTENER_JOINED_EVENT:String = "FIRST_LISTENER_JOINED_EVENT";
		public static const ROOM_MUTE_STATE:String = "ROOM_MUTE_STATE";
		public static const REGISTER_LISTENERS:String = "REGISTER_LISTENERS";
		public static const SET_LOCAL_MODERATOR_STATUS:String = "SET_LOCAL_MODERATOR";
		
		public var mute_state:Boolean;
		public var listeners:Listeners;
		public var moderator:Boolean;
		
		public function ListenersEvent(type:String)
		{
			super(type, true, false);
		}
	}
}