package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	public class TopToolbarChat extends TopToolbarBase {
		public function TopToolbarChat() {
			super();
			
			leftButton.styleName = "icon-left-arrow topButton topLeftButton";
			rightButton.styleName = "icon-presentation topButton topRightButton";
		}
	}
}
