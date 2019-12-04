package org.bigbluebutton.air.user.views {
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	public class TopToolbarUserDetails extends TopToolbarBase {
		public function TopToolbarUserDetails() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
