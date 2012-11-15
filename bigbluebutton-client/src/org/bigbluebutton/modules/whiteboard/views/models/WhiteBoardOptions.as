package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class WhiteBoardOptions
	{
		[Bindable] public var baseTabIndex:int;
		
		public function WhiteBoardOptions() {
			//LogUtil.debug("WATERFALL WBOptions Entering constructor");
			var vxml:XML = 	BBB.getConfigForModule("WhiteboardModule");
			if (vxml != null) {
				if (vxml.@baseTabIndex != undefined) {
					//LogUtil.debug("WATERFALL WBOptions About to set baseTabIndex");
					baseTabIndex = vxml.@baseTabIndex;
					//LogUtil.debug("WATERFALL WBOptions Survived set baseTabIndex of " + baseTabIndex);
				}
			}
		}
		
		public function getBaseIndex():int{
			return baseTabIndex;
		}
	}
}