package org.bigbluebutton.modules.whiteboard.views.models {
	import org.bigbluebutton.core.Options;

	public class WhiteboardOptions extends Options {

		[Bindable]
		public var baseTabIndex:int = 701;

		[Bindable]
		public var keepToolbarVisible:Boolean = false;

		[Bindable]
		public var onlyPenMUW:Boolean = false;

		public function WhiteboardOptions() {
			name = "WhiteboardModule";
		}
	}
}
