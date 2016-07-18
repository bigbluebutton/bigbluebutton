package org.bigbluebutton.modules.caption.model {
	import org.bigbluebutton.core.BBB;
	
	public class CaptionOptions {
		
		[Bindable]
		public var baseTabIndex:int = 701;
		
		public function CaptionOptions() {
			var cxml:XML = BBB.getConfigForModule("CaptionModule");
			if (cxml != null) {
				if (cxml.@baseTabIndex != undefined) {
					baseTabIndex = cxml.@baseTabIndex;
				}
			}
		}
	}
}