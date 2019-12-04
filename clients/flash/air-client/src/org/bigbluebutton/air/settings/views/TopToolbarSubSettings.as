package org.bigbluebutton.air.settings.views {
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	public class TopToolbarSubSettings extends TopToolbarBase {
		public function TopToolbarSubSettings() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "saveButton topRightButton";
			rightButton.label = "SAVE";
		}
	}
}
