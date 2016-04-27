package org.bigbluebutton.web.user.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.lib.user.models.User;
	
	import spark.components.Button;
	import spark.components.gridClasses.GridItemRenderer;
	
	public class StatusItemRenderer extends GridItemRenderer {
		private var statusButton:Button;
		
		public function StatusItemRenderer() {
			super();
			
			statusButton = new Button();
			statusButton.enabled = false;
			statusButton.width = 21;
			statusButton.height = 21;
			statusButton.addEventListener(MouseEvent.CLICK, handleStatusButtonClickEvent);
			addElement(statusButton);
		}
		
		private function handleStatusButtonClickEvent(e:MouseEvent):void {
			if (data != null) {
				if (data.raiseHand) {
					(grid.dataGrid as UserDataGrid).lowerHand(data.userID);
				} else {
					(grid.dataGrid as UserDataGrid).changePresenter(data.userID);
				}
			}
		}
		
		override public function prepare(hasBeenRecycled:Boolean):void {
			if (data != null) {
				var amIModerator:Boolean = (grid.dataGrid as UserDataGrid).amIModerator;
				
				if (hovered && data.status == User.RAISE_HAND && amIModerator) {
					statusButton.styleName = "userButtonStyle statusHandStyle";
					statusButton.enabled = true;
				} else if (hovered && !data.presenter && !data.phoneUser && amIModerator) {
					statusButton.styleName = "userButtonStyle statusPresenterStyle";
					statusButton.enabled = true;
				} else if (data.status == User.RAISE_HAND) {
					statusButton.styleName = "userButtonStyle statusHandStyle";
					statusButton.enabled = false;
				} else if (data.presenter) {
					statusButton.styleName = "userButtonStyle statusPresenterStyle";
					statusButton.enabled = false;
				} else if (data.role == User.MODERATOR) {
					statusButton.styleName = "userButtonStyle statusModeratorStyle";
					statusButton.enabled = false;
				} else {
					statusButton.styleName = "userButtonStyle";
					statusButton.enabled = false;
				}
			}
		}
	}
}
