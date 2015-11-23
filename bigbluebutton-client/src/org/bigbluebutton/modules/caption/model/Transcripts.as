package org.bigbluebutton.modules.caption.model {
	import mx.collections.ArrayCollection;

	public class Transcripts {
		private var _transcriptCollection:ArrayCollection;
		private var _historyInited:Boolean = false;
		
		public var historyInitCallback:Function;
		
		public function Transcripts() {
			_transcriptCollection = new ArrayCollection();
		}
		
		// There is a race condition if someone is editing while the history is being 
		// loaded. I'm not sure what to do about it.
		//
		// Maybe place changes in a holding pattern until history has been loaded and then apply them?
		
		public function get historyIntited():Boolean {
			return _historyInited;
		}
		
		public function receiveCaptionHistory(history:Object):void {
			for (var locale:Object in history){
				findLocale(locale as String).editHistory(0,0,history[locale]);
			}
			_historyInited = true;
			if (historyInitCallback != null) historyInitCallback();
		}
		
		public function editCaptionHistory(locale:String, startIndex:int, endIndex:int, text:String):void {
			findLocale(locale).editHistory(startIndex, endIndex, text);
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