package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class ReceiveNewCaptionLineEvent extends Event {
		public static const RECEIVE_NEW_CAPTION_LINE:String = "RECEIVE_NEW_CAPTION_LINE_EVENT";
		
		public var lineNumber:int = -1;
		public var locale:String = "";
		public var text:String = "";
		
		public function ReceiveNewCaptionLineEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}