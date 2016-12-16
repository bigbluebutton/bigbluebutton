package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	public class TopToolbarChat extends TopToolbarAIR {
		public function TopToolbarChat() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
