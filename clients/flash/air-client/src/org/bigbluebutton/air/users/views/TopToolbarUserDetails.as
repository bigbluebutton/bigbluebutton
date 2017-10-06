package org.bigbluebutton.air.users.views {
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarUserDetails extends TopToolbarAIR {
		public function TopToolbarUserDetails() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
