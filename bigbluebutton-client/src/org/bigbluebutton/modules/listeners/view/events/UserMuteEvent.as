package org.bigbluebutton.modules.listeners.view.events
{
	import flash.events.Event;

	public class UserMuteEvent extends Event
	{
		public var userid:Number;
		public var mute:Boolean;
		
		public function UserMuteEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}