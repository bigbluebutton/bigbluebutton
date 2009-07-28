package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class ModeEvent extends Event
	{
		public static const MODE_INIT_EVENT:String = 'ModeInitializedEvent';
		public var mode:String;
		
		public function ModeEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}