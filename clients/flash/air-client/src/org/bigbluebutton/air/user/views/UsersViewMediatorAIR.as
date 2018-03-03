package org.bigbluebutton.air.user.views {
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.air.user.events.UserItemSelectedEvent;
	
	public class UsersViewMediatorAIR extends UsersViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			uiSession.pushPage(PageEnum.USER_DETAILS, e.user.intId);
		}
	}
}
