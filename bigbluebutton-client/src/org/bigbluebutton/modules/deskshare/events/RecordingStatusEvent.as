package org.bigbluebutton.modules.deskshare.events
{
	import flash.events.Event;

	public class RecordingStatusEvent extends Event
	{
		public static const DESKSHARE_RECORD_EVENT = "DESKSHARE_RECORD_EVENT";
		
		public static const RECORD_STOPPED_EVENT = "DESKSHARE_RECORD_STOPPED_EVENT";
		public static const RECORD_STARTED_EVENT = "DESKSHARE_RECORD_STARTED_EVENT";
		public static const RECORD_UPDATED_EVENT = "DESKSHARE_RECORD_UPDATED_EVENT";
		public static const RECORD_ERROR_EVENT = "DESKSHARE_RECORD_ERROR_EVENT";
		
		public var status:String;
		
		public function RecordingStatusEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
		{
			super(type, bubbles, cancelable);
		}
		
	}
}