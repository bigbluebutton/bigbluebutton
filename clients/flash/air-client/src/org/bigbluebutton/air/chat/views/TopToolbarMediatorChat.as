package org.bigbluebutton.air.chat.views {
	import flash.events.MouseEvent;
	
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.main.views.TopToolbarMediatorBase;
	import org.bigbluebutton.lib.user.models.User;
	
	public class TopToolbarMediatorChat extends TopToolbarMediatorBase {
		[Inject]
		public var uiSession:IUISession;
		
		override protected function setTitle():void {
			var data:Object = uiSession.currentPageDetails;
			
			if (data != null) {
				if (data.publicChat) {
					view.titleLabel.text = "Public Chat";
				} else {
					var user:User = userSession.userList.getUserByUserId(data.userId);
					view.titleLabel.text = user.name;
				}
			}
		}
		
		override protected function leftButtonClickHandler(e:MouseEvent):void {
			uiSession.popPage();
		}
		
		override protected function rightButtonClickHandler(e:MouseEvent):void {
			uiSession.pushPage(PageEnum.MAIN);
		}
	}
}
