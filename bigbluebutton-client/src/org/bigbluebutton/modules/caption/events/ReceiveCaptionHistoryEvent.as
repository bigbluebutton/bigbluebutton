package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class ReceiveCaptionHistoryEvent extends Event {
		public static const RECEIVE_CAPTION_HISTORY_EVENT:String = "RECEIVE_CAPTION_HISTORY_EVENT";
		
		public var history:Object;
		
		public function ReceiveCaptionHistoryEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}