package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class ReceiveCurrentCaptionLineEvent extends Event {
		public static const RECEIVE_CURRENT_CAPTION_LINE:String = "RECEIVE_CURRENT_CAPTION_LINE_EVENT";
		
		public var locale:String = "";
		public var text:String = "";
		
		public function ReceiveCurrentCaptionLineEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}