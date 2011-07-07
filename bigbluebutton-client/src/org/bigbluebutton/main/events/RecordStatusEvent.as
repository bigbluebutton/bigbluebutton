package org.bigbluebutton.main.events
{
	import flash.events.Event;

	public class RecordStatusEvent extends Event
	{
		public static const RECORD_STATUS_EVENT:String = "RECORD_STATUS_EVENT";
		
		public var module:String;
		public var status:String;
		
		public function RecordStatusEvent(bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(RECORD_STATUS_EVENT, bubbles, cancelable);
		}
		
	}
}