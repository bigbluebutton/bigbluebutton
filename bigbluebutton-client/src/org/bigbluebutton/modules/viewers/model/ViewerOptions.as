package org.bigbluebutton.modules.viewers.model
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class ViewerOptions
	{
		[Bindable] public var windowVisible:Boolean = true;
		[Bindable] public var baseTabIndex:int;
		
		public function ViewerOptions() {
			var vxml:XML = 	BBB.getConfigForModule("ViewersModule");
			if (vxml != null) {
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
			}
		}
		
		public function getBaseIndex():int{
			return baseTabIndex;
		}
	}
}