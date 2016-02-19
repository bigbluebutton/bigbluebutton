package org.bigbluebutton.air.main.views.topbar {
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	
	import spark.components.Button;
	import spark.components.Label;
	
	public class TopBarView extends TopBar implements ITopBarView {
		
		public function get participantsBtn():NavigationButton {
			return participantsBtn0;
		}
		
		public function get backBtn():NavigationButton {
			return backBtn0
		}
		
		public function get pageName():Label {
			return pageName0;
		}
		
		public function get profileBtn():NavigationButton {
			return profileBtn0;
		}
		
		public function get leftPresentationBtn():NavigationButton {
			return leftPresentationBtn0;
		}
		
		public function get rightPresentationBtn():NavigationButton {
			return rightPresentationBtn0;
		}
	
	}
}
