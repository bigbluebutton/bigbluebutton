package org.bigbluebutton.modules.deskShare.events
{
	import flash.events.Event;

	public class ViewWindowEvent extends Event
	{
		public static const CLOSE:String = "Deskshare View Window Close Event";
		
		public function ViewWindowEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}