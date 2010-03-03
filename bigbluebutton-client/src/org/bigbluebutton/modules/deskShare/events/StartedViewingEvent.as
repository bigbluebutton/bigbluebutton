package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;
	
	public class StartedViewingEvent extends Event
	{
		public static const STARTED_VIEWING_EVENT:String = "STARTED VIEWING DESKSHARE EVENT";
		
		public function StartedViewingEvent(type: String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}