package org.bigbluebutton.modules.present.ui.views
{
	public class PresentOptions
	{
		[Bindable]
		public var showWindowControls:Boolean = true;
		
		public function PresentOptions()
		{
			var vxml:XML = BBB.getConfigForModule("PresentationModule");
			if (vxml != null) {
				if (vxml.@showWindowControls != undefined) {
					showWindowControls = (vxml.@showWindowControls.toString().toUpperCase() == "TRUE") ? true : false;
				}
			}
		}
	}
}