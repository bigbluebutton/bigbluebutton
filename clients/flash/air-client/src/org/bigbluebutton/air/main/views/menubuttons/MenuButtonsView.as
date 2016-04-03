package org.bigbluebutton.air.main.views.menubuttons {
	
	import org.bigbluebutton.air.main.views.ui.navigationbutton.NavigationButton;
	
	import spark.components.Button;
	
	public class MenuButtonsView extends MenuButtons implements IMenuButtonsView {
		public function get menuDeskshareButton():NavigationButton {
			return deskshareBtn0;
		}
		
		public function get menuVideoChatButton():NavigationButton {
			return videochatBtn0;
		}
		
		public function get menuPresentationButton():NavigationButton {
			return presentationBtn0;
		}
		
		public function get pushToTalkButton():Button {
			return pushToTalkButton0;
		}
		
		public function get menuChatButton():NavigationButton {
			return chatBtn0;
		}
		
		public function get menuParticipantsButton():NavigationButton {
			return participantsBtn0;
		}
	}
}
