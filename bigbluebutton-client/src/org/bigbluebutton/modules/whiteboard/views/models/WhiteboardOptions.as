package org.bigbluebutton.modules.whiteboard.views.models
{
	import org.bigbluebutton.core.BBB;
	public class WhiteboardOptions
	{
		[Bindable] public var whiteboardAccess:String = "presenter";
		[Bindable] public var baseTabIndex:int = 701;
        [Bindable] public var keepToolbarVisible:Boolean = false;
        
		public function WhiteboardOptions() {
			var vxml:XML = 	BBB.getConfigForModule("WhiteboardModule");
			if (vxml != null) {
				if (vxml.@whiteboardAccess != undefined) {
					whiteboardAccess = vxml.@whiteboardAccess;
				}

				if (vxml.@baseTabIndex != undefined) {
					baseTabIndex = vxml.@baseTabIndex;
				}
                
                if (vxml.@keepToolbarVisible != undefined) {
                    keepToolbarVisible = (vxml.@keepToolbarVisible.toString().toUpperCase() == "TRUE") ? true : false;
                }
			}
		}
	}
}
