package org.bigbluebutton.modules.video.view.events
{
	import flash.events.Event;

	public class StartCameraEvent extends Event
	{
		public static const NAME:String = "StartCameraEvent";
		
		public function StartCameraEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}