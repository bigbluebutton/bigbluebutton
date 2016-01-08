package org.bigbluebutton.modules.caption.events {
	import flash.events.Event;
	
	public class RequestTranscriptsEvent extends Event {
		public static const REQUEST_TRANSCRIPTS_EVENT:String = "REQUEST_TRANSCRIPTS_EVENT";
		
		public var callback:Function;
		
		public function RequestTranscriptsEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false) {
			super(type, bubbles, cancelable);
		}
	}
}