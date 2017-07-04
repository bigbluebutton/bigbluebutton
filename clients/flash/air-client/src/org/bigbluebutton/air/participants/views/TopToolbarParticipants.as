package org.bigbluebutton.air.participants.views {
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarParticipants extends TopToolbarAIR {
		public function TopToolbarParticipants() {
			super();
			
			leftButton.setVisible(false);
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
