package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class StopCaptionModuleEvent extends Event {
		public static const STOP_CAPTION_MODULE_EVENT:String = "STOP_CAPTION_MODULE_EVENT";
		
		public function StopCaptionModuleEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}