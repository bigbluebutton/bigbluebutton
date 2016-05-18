package org.bigbluebutton.air.main.views.menubuttons {
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	import spark.components.Button;
	
	public class MenuButtonsView extends MenuButtons implements IMenuButtonsView {
		public function get camButton():Button {
			return camBtn0;
		}
		
		public function get micButton():Button {
			return micBtn0;
		}
		
		public function get statusButton():Button {
			return statusBtn0;
		}
	}
}
