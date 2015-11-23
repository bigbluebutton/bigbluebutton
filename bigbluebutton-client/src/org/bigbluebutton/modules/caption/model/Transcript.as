package org.bigbluebutton.modules.caption.model {
	import flash.events.Event;
	import flash.events.EventDispatcher;

	public class Transcript extends EventDispatcher {
		public var transcript:String;
		
		private var _locale:String;
		
		public function get locale():String {
			return _locale;
		}
		
		public function Transcript(locale:String) {
			_locale = locale;
			transcript = "";
		}
		
		public function getTranscript():String {
			return transcript;
		}
		
		public function editHistory(startIndex:int, endIndex:int, text:String):void {
			var startSlice:String = transcript.slice(0, startIndex);
			var endSlice:String = transcript.slice(endIndex);
			
			transcript = startSlice + text + endSlice;
			dispatchEvent(new Event(Event.CHANGE));
		}
	}
}