package org.bigbluebutton.modules.caption.model {
	import flash.utils.getDefinitionByName;
	import flash.utils.getQualifiedClassName;
	
	import mx.collections.ArrayCollection;

	public class Transcripts {
		[Bindable]
		public var transcriptCollection:ArrayCollection;
		
		private var _historyInited:Boolean = false;
		
		public function Transcripts() {
			transcriptCollection = new ArrayCollection();
		}
		
		// There is a race condition if someone is editing while the history is being 
		// loaded. I'm not sure what to do about it.
		//
		// Maybe place changes in a holding pattern until history has been loaded and then apply them?
		
		public function get historyIntited():Boolean {
			return _historyInited;
		}
		
		public function receiveCaptionHistory(history:Object):void {
			for (var locale:Object in history) {
				trace("The class name of variable: " + locale + ", is: " + flash.utils.getQualifiedClassName(locale));
				
				// This convoluted conversion from Object to the actual class is required to get the accurate 
				// String value. See, http://stackoverflow.com/a/204003, for more information
				var localeClassName:String = flash.utils.getQualifiedClassName(locale);
				var localeClass:Class = flash.utils.getDefinitionByName(localeClassName) as Class;
				
				var t:Transcript = findLocale((locale as localeClass).toString());
				t.ownerID = history[locale][0];
				t.editHistory(0,0,history[locale][1]);
			}
			_historyInited = true;
		}
		
		public function updateCaptionOwner(locale:String, ownerID:String):void {
			findLocale(locale).ownerID = ownerID;
		}
		
		public function editCaptionHistory(locale:String, startIndex:int, endIndex:int, text:String):void {
			findLocale(locale).editHistory(startIndex, endIndex, text);
		}
		
		public function findLocale(locale:String):Transcript {
			for each (var t:Transcript in transcriptCollection) {
				if (t.locale == locale) return t;
			}
			
			var newTranscript:Transcript = new Transcript(locale);
			transcriptCollection.addItem(newTranscript);
			return newTranscript;
		}
	}
}