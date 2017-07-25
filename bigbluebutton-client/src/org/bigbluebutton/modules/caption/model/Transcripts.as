/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */

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
		
		public function receiveCaptionHistory(history:ArrayCollection):void {
			for each(var receivedTranscript:Transcript in history) {
				// This convoluted conversion from Object to the actual class is required to get the accurate 
				// String value. See, http://stackoverflow.com/a/204003, for more information
				//var localeClassName:String = flash.utils.getQualifiedClassName(locale);
				//var localeClass:Class = flash.utils.getDefinitionByName(localeClassName) as Class;
				
				var t:Transcript = findLocale(receivedTranscript.locale, receivedTranscript.localeCode);
				t.ownerID = receivedTranscript.ownerID;
				t.transcript = receivedTranscript.transcript;
			}
			_historyInited = true;
		}
		
		public function updateCaptionOwner(locale:String, code:String, ownerID:String):void {
			findLocale(locale, code).ownerID = ownerID;
		}
		
		public function editCaptionHistory(locale:String, code:String, startIndex:int, endIndex:int, text:String):void {
			if (_historyInited) { // ignore updates until after history has been loaded
				findLocale(locale, code).editHistory(startIndex, endIndex, text);
			}
		}
		
		public function findLocale(locale:String, code:String):Transcript {
			for each (var t:Transcript in transcriptCollection) {
				if (t.locale == locale) return t;
			}
			
			var newTranscript:Transcript = new Transcript(locale, code);
			transcriptCollection.addItem(newTranscript);
			return newTranscript;
		}
	}
}