package org.bigbluebutton.modules.caption.model {
	import flash.events.Event;
	import flash.events.EventDispatcher;

	public class Transcript extends EventDispatcher {
		[Bindable]
		public var transcript:String;
		
		[Bindable]
		public var ownerID:String;
		
		[Bindable]
		public var locale:String;
		
		public function Transcript(l:String) {
			locale = l;
			transcript = "";
			ownerID = "";
		}
		
		public function editHistory(startIndex:int, endIndex:int, text:String):void {
			var startSlice:String = transcript.slice(0, startIndex);
			var endSlice:String = transcript.slice(endIndex);
			
			transcript = startSlice + text + endSlice;
		}
	}
}