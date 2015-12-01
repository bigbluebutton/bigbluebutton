package org.bigbluebutton.air.main.views.menubuttons {
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	
	import spark.components.Button;
	
	public interface IMenuButtonsView {
		function get menuDeskshareButton():NavigationButton
		function get menuVideoChatButton():NavigationButton
		function get menuPresentationButton():NavigationButton
		function get menuChatButton():NavigationButton
		function get menuParticipantsButton():NavigationButton
		function get pushToTalkButton():Button;
	}
}
