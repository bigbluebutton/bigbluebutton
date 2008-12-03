package org.bigbluebutton.modules.listeners.view.events
{
	import flash.events.Event;

	public class ListenerSelectedEvent extends Event
	{
		public static const LISTENER_SELECTED_EVENT:String = "LISTENER_SELECTED_EVENT";
		
		public var isModerator:Boolean = false;
		public var selectedListener:Number;
		
		public function ListenerSelectedEvent(moderator:Boolean, listener:Number, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(LISTENER_SELECTED_EVENT, bubbles, cancelable);
			isModerator = moderator;
			selectedListener = listener;
		}
		
	}
}