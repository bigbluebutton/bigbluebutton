package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class ReceiveUpdateCaptionOwnerEvent extends Event {
		public static const RECEIVE_UPDATE_CAPTION_OWNER_EVENT:String = "RECEIVE_UPDATE_CAPTION_OWNER_EVENT";
		
		public var locale:String = "";
		public var ownerID:String = "";
		
		public function ReceiveUpdateCaptionOwnerEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}