package org.bigbluebutton.air.participants.views {
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	public class TopToolbarParticipants extends TopToolbarBase {
		public function TopToolbarParticipants() {
			super();
			
			leftButton.setVisible(false);
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
