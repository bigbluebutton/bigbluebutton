package org.bigbluebutton.air.main.views.menubuttons {
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	import spark.components.Button;
	
	public interface IMenuButtonsView {
		function get camButton():Button
		function get micButton():Button
		function get statusButton():Button
	}
}
