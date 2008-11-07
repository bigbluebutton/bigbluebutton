package org.bigbluebutton.modules.listeners.view.events
{
	import flash.events.Event;

	public class UserTalkEvent extends Event
	{
		public var userid:Number;
		public var talk:Boolean;
		
		public function UserTalkEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}