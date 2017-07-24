package org.bigbluebutton.core.events
{
	import flash.events.Event;
	
	public class GetVoiceUsersEvent extends Event
	{
		public function GetVoiceUsersEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
	}
}