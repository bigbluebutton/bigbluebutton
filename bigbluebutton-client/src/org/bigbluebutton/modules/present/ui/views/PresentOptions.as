package org.bigbluebutton.modules.present.ui.views
{

	import org.bigbluebutton.core.BBB;
	
	public class PresentOptions
	{
		[Bindable]
		public var showWindowControls:Boolean = true;
		public var showFullScreenButton:String = "FALSE";
		
		public function PresentOptions()
		{
			var vxml:XML = BBB.getConfigForModule("PresentModule");
			if (vxml != null) {
				if (vxml.@showWindowControls != undefined) {
					showWindowControls = (vxml.@showWindowControls.toString().toUpperCase() == "TRUE") ? true : false;
				}
				if (vxml.@showFullScreenButton != undefined) {
					showFullScreenButton = (vxml.@showFullScreenButton.toString().toUpperCase() == "TRUE"
											|| vxml.@showFullScreenButton.toString().toUpperCase() == "TOOLBAR") ? 
											vxml.@showFullScreenButton.toString().toUpperCase() : "FALSE";
				}
			}
		}
	}
}