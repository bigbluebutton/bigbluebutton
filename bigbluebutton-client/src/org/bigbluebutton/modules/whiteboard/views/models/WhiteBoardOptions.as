package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class WhiteBoardOptions
	{
		[Bindable] public var baseTabIndex:int;
		
		public function WhiteBoardOptions() {
			var vxml:XML = 	BBB.getConfigForModule("WhiteboardModule");
			if (vxml != null) {
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 601;
				}
			}
		}
		
		public function getBaseIndex():int{
			return baseTabIndex;
		}
	}
}