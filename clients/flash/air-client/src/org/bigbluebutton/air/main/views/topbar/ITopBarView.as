package org.bigbluebutton.air.main.views.topbar {
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	
	import spark.components.Label;
	
	public interface ITopBarView {
		function get participantsBtn():NavigationButton;
		function get backBtn():NavigationButton;
		function get pageName():Label;
		function get profileBtn():NavigationButton;
		function get rightPresentationBtn():NavigationButton;
		function get leftPresentationBtn():NavigationButton;
	}
}
