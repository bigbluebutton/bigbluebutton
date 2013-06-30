package org.bigbluebutton.modules.polling.events
{
	import flash.events.Event;
	
	public class OpenTakePollWindowEvent extends Event
	{
		public static const OPEN_TAKE_POLL_WINDOW:String = "open take poll window event";
		
		private var _pollID:String;
		
		public function OpenTakePollWindowEvent(pollID:String)
		{
			super(OPEN_TAKE_POLL_WINDOW, true, false);
			_pollID = pollID;
		}
		
		public function get pollID():String {
			return _pollID;
		}
	}
}