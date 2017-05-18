package org.bigbluebutton.modules.polling.model {
	import org.bigbluebutton.core.Options;

	public class PollOptions extends Options {

		[Bindable]
		public var baseTabIndex:int = 50;

		public function PollOptions() {
			name = "PollingModule";
		}

		public function getBaseIndex():int {
			return baseTabIndex;
		}
	}
}
