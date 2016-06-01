package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class SendUpdateCaptionOwnerEvent extends Event {
		public static const SEND_UPDATE_CAPTION_OWNER_EVENT:String = "SEND_UPDATE_CAPTION_OWNER_EVENT";
		
		public var locale:String = "";
		public var claim:Boolean = false;
		
		public function SendUpdateCaptionOwnerEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}