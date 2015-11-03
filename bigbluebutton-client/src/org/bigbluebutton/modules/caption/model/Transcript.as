package org.bigbluebutton.modules.caption.model {
	import flash.events.Event;
	import flash.events.EventDispatcher;
	
	import mx.collections.ArrayCollection;

	public class Transcript extends EventDispatcher {
		public var transcript:ArrayCollection;
		public var currentLine:String = "";
		
		private var _locale:String;
		
		public function get locale():String {
			return _locale;
		}
		
		public function Transcript(locale:String) {
			_locale = locale;
			transcript = new ArrayCollection();
		}
		
		public function getTranscript():ArrayCollection {
			return transcript;
		}
		
		public function newCaptionLine(lineNumber:int, text:String):void {
			if (lineNumber >= 0) {
				transcript.addItemAt(text, Math.min(lineNumber, transcript.length));
				dispatchEvent(new Event(Event.CHANGE));
			}
		}
		
		public function updateCurrentCaptionLine(text:String):void {
			currentLine = text;
			dispatchEvent(new Event(Event.CHANGE));
		}
	}
}