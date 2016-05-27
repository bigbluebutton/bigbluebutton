package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class StartCaptionModuleEvent extends Event {
		public static const START_CAPTION_MODULE_EVENT:String = "START_CAPTION_MODULE_EVENT";
		
		public var attributes:Object;
		
		public function StartCaptionModuleEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}