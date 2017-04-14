package org.bigbluebutton.air.participants.views {
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	
	public class TopToolbarParticipants extends TopToolbarBase {
		public function TopToolbarParticipants() {
			super();
			
			leftButton.styleName = "topButton";
			rightButton.styleName = "presentationButton topButton";
		}
	}
}
