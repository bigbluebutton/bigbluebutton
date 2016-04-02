package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class ReceiveEditCaptionHistoryEvent extends Event {
		public static const RECEIVE_EDIT_CAPTION_HISTORY:String = "RECEIVE_EDIT_CAPTION_HISTORY";
		
		public var startIndex:int = -1;
		public var endIndex:int = -1;
		public var locale:String = "";
		public var text:String = "";
		
		public function ReceiveEditCaptionHistoryEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}