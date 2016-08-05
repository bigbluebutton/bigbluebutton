package org.bigbluebutton.modules.caption.model {
	import org.bigbluebutton.core.BBB;
	
	public class CaptionOptions {
		
		[Bindable] 
		public var maxPasteLength:int = 1024;
		
		[Bindable]
		public var baseTabIndex:int = 701;
		
		public function CaptionOptions() {
			var cxml:XML = BBB.getConfigForModule("CaptionModule");
			if (cxml != null) {
				if (cxml.@maxPasteLength != undefined) {
					maxPasteLength = cxml.@maxPasteLength;
				}
				
				if (cxml.@baseTabIndex != undefined) {
					baseTabIndex = cxml.@baseTabIndex;
				}
			}
		}
	}
}