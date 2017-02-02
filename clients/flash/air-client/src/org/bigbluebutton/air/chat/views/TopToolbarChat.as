package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.lib.main.views.TopToolbarBase;
	
	public class TopToolbarChat extends TopToolbarBase {
		public function TopToolbarChat() {
			super();
			
			leftButton.styleName = "backButton topButton";
			rightButton.styleName = "presentationButton topButton";
		}
	}
}
