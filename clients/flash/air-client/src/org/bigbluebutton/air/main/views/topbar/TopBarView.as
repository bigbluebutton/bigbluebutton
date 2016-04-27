package org.bigbluebutton.air.main.views.topbar {
	
	import spark.components.Label;
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	
	public class TopBarView extends TopBarBase implements ITopBarView {
		
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
