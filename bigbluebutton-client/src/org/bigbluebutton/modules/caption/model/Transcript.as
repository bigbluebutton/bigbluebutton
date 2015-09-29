package org.bigbluebutton.modules.caption.model {
	import mx.collections.ArrayCollection;

	public class Transcript {
		[Bindable]
		public var transcript:ArrayCollection;
		
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
			}
		}
		
		
	}
}