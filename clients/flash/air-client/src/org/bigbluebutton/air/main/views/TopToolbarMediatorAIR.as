package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	import org.bigbluebutton.lib.user.models.User2x;
	
	public class TopToolbarMediatorAIR extends TopToolbarMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function setTitle():void {
			if (uiSession.currentPage == PageEnum.CHAT) {
				var chatData:Object = uiSession.currentPageDetails;
				
				if (chatData != null) {
					if (chatData.publicChat) {
						view.titleLabel.text = "Public Chat";
					} else {
						var userC:User2x = meetingData.users.getUser(chatData.intId);
						view.titleLabel.text = userC.name;
					}
				}
			} else if (uiSession.currentPage == PageEnum.PARTICIPANTS) {
				view.titleLabel.text = "Participants";
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				view.titleLabel.text = uiSession.currentPage.replace(/([A-Z])/g, ' $1');
			} else if (uiSession.currentPage == PageEnum.USER_DETAILS) {
				view.titleLabel.text = "User Details";
			} else {
				view.titleLabel.text = conferenceParameters.meetingName;
			}
		}
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.PARTICIPANTS);
			} else {
				uiSession.popPage();
			}
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			if (uiSession.currentPage == PageEnum.MAIN) {
				uiSession.pushPage(PageEnum.SETTINGS);
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				uiSession.popPage();
			} else {
				uiSession.pushPage(PageEnum.MAIN);
			}
		}
	}
}
