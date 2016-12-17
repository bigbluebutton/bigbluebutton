package org.bigbluebutton.air.settings.views {
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarSettings extends TopToolbarAIR {
		public function TopToolbarSettings() {
			titleLabel.text = "Settings";
			leftButton.styleName = "icon-presentation topButton topLeftButton";
			rightButton.setVisible(false);
		}
	}
}
