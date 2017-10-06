package org.bigbluebutton.air.users.views {
	import org.bigbluebutton.air.common.PageEnum;
	import org.bigbluebutton.air.main.models.IUISession;
	import org.bigbluebutton.lib.user.events.UserItemSelectedEvent;
	import org.bigbluebutton.lib.user.views.UsersViewMediatorBase;
	
	public class UsersViewMediatorAIR extends UsersViewMediatorBase {
		
		[Inject]
		public var uiSession:IUISession;
		
		override protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			uiSession.pushPage(PageEnum.USER_DETAILS, e.user.intId);
		}
	}
}
