package org.bigbluebutton.modules.polling.model
{
	import org.bigbluebutton.core.BBB;
	public class PollOptions
	{
		[Bindable] public var baseTabIndex:int;
		
		public function PollOptions() {
			var vxml:XML = 	BBB.getConfigForModule("PollingModule");
			if (vxml != null) {
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 50;
				}
			}
		}
		
		public function getBaseIndex():int{
			return baseTabIndex;
		}
	}
}