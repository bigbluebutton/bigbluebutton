package org.bigbluebutton.air.main.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	import org.bigbluebutton.lib.user.models.User;
	
	public class TopToolbarMediatorAIR extends TopToolbarMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function setTitle():void {
			if (uiSession.currentPage == PageEnum.CHAT) {
				var data:Object = uiSession.currentPageDetails;
				
				if (data != null) {
					if (data.publicChat) {
						view.titleLabel.text = "Public Chat";
					} else {
						var user:User = userSession.userList.getUserByUserId(data.userId);
						view.titleLabel.text = user.name;
					}
				}
			} else if (uiSession.currentPage == PageEnum.PARTICIPANTS) {
				view.titleLabel.text = "Participants";
			} else if (uiSession && uiSession.currentPage.indexOf("Settings") > 0) {
				view.titleLabel.text = uiSession.currentPage.replace(/([A-Z])/g, ' $1');
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
