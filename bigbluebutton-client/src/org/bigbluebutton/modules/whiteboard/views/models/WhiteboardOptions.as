package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.common.LogUtil;
	public class WhiteboardOptions
	{
		[Bindable] public var whiteboardAccess:String;
		
		[Bindable] public var baseTabIndex:int;

		public function WhiteboardOptions() {
			var vxml:XML = 	BBB.getConfigForModule("WhiteboardModule");
			if (vxml != null) {
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
	}
}
