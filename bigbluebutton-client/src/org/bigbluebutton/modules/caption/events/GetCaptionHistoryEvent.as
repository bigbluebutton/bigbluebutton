package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class GetCaptionHistoryEvent extends Event {
		public static const GET_CAPTION_HISTORY_EVENT:String = "GET_CAPTION_HISTORY_EVENT";
		
		public function GetCaptionHistoryEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}