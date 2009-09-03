package org.bigbluebutton.modules.videoconf.events
{
	import flash.events.Event;
	
	public class OpenPublishWindowEvent extends Event
	{
		public static const OPEN_PUBLISH_WINDOW:String = "OPEN_PUBLISH_WINDOW";
		
		public function OpenPublishWindowEvent(type:String = OPEN_PUBLISH_WINDOW)
		{
			super(type, true, false);
		}

	}
}