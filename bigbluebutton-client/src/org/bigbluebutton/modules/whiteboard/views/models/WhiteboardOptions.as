package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class WhiteboardOptions
	{
		[Bindable] public var baseTabIndex:int;
		[Bindable] public var whiteboardAccess:String;

		public function WhiteboardOptions() {
			var vxml:XML = 	BBB.getConfigForModule("WhiteboardModule");
			if (vxml != null) {
				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
				else{
					baseTabIndex = 601;
				}
				
				if (vxml.@whiteboardAccess != undefined) {
					whiteboardAccess = vxml.@whiteboardAccess;
				}
				else{
					whiteboardAccess = "presenter";
				}

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