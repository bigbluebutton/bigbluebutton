package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class StreamEvent extends Event
	{
		public static const START:String = "Deskshare Stream Started Event";
		public static const STOP:String = "Deskshare Stream Stopped Event";
		
		public var videoWidth:Number = 0;
		public var videoHeight:Number = 0;
		
		public function StreamEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}