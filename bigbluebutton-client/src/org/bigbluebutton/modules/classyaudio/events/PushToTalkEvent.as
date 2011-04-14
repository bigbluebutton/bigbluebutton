package org.bigbluebutton.modules.classyaudio.events
{
	import flash.events.Event;

	public class PushToTalkEvent extends Event
	{
		public static const BUTTON_PUSHED:String = "Push to talk pushed";
		public static const BUTTON_RELEASED:String = "Push to talk released";
		
		public function PushToTalkEvent(type:String)
		{
			super(type, true, false);
		}
	}
}