package org.bigbluebutton.air.settings.views {
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	public class TopToolbarSettings extends TopToolbarBase {
		public function TopToolbarSettings() {
			titleLabel.text = "Settings";
			leftButton.styleName = "icon-presentation topButton topLeftButton";
			rightButton.setVisible(false);
		}
	}
}
