package org.bigbluebutton.web.user.views {
	import org.bigbluebutton.lib.user.models.User;
	
	import spark.components.Button;
	import spark.components.gridClasses.GridItemRenderer;
	
	public class StatusItemRenderer extends GridItemRenderer {
		private var statusButton:Button;
		
		public function StatusItemRenderer() {
			super();
			
			statusButton = new Button();
			statusButton.width = 21;
			statusButton.height = 21;
			addElement(statusButton);
		}
		
		override public function prepare(hasBeenRecycled:Boolean):void {
			if (data != null) {
				if (data.raiseHand) {
					statusButton.styleName = "userButtonStyle statusHandStyle";
				} else if (data.presenter) {
					statusButton.styleName = "userButtonStyle statusPresenterStyle";
				} else if (data.role == User.MODERATOR) {
					statusButton.styleName = "userButtonStyle statusModeratorStyle";
				} else {
					statusButton.styleName = "userButtonStyle";
				}
			}
		}
	}
}
