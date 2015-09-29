package org.bigbluebutton.modules.caption.model {
	import mx.collections.ArrayCollection;

	public class Transcripts {
		
		
		private var _transcriptCollection:ArrayCollection;
		
		public function Transcripts() {
			_transcriptCollection = new ArrayCollection();
		}
		
		// There is a race condition if someone is editing while the history is being 
		// loaded. I'm not sure what to do about it.
		//
		// Maybe place changes in a holding pattern until history has been loaded and then apply them?
		
		public function receiveCaptionHistory(history:Object):void {
			for (var locale:Object in history){
				var t:Transcript = findLocale(locale as String);
				var ta:Array = history[locale];
				for (var i:int = ta.length-1; i >= 0; i--) {
					t.newCaptionLine(0, ta[i]);
				}
			}
		}
		
		public function newCaptionLine(locale:String, lineNumber:int, text:String):void {
			findLocale(locale).newCaptionLine(lineNumber, text);
		}
		
		public function findLocale(locale:String):Transcript {
			for each (var t:Transcript in _transcriptCollection) {
				if (t.locale == locale) return t;
			}
			
			var newTranscript:Transcript = new Transcript(locale);
			_transcriptCollection.addItem(newTranscript);
			return newTranscript;
		}
	}
}