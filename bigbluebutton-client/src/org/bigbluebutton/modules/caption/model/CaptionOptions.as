package org.bigbluebutton.modules.caption.model {
	import org.bigbluebutton.core.Options;

	public class CaptionOptions extends Options {

		[Bindable]
		public var maxPasteLength:int = 1024;

		[Bindable]
		public var baseTabIndex:int = 701;

		public function CaptionOptions() {
			name = "CaptionModule";
		}
	}
}
