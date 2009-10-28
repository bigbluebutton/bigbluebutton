package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class ShareWindowEvent extends Event
	{
		public static const CLOSE:String = "Deskshare Share Window Close Event";
		
		public function ShareWindowEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}