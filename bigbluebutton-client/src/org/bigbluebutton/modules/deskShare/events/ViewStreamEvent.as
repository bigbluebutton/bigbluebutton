package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class ViewStreamEvent extends Event
	{
		public static const START:String = "Start Viewing Stream Event";
		public static const STOP:String = "Stop Viewing Stream Event";
		
		public var videoWidth:Number = 0;
		public var videoHeight:Number = 0;
		
		public function ViewStreamEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}