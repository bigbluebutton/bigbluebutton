package org.bigbluebutton.web.user.views {
	import org.bigbluebutton.lib.main.models.IUserSession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UserWindowMediator extends Mediator {
		
		[Inject]
		public var view:UserWindow;
		
		[Inject]
		public var userSession:IUserSession;
		
		override public function initialize():void {
			view.usersGrid.dataProvider = userSession.userList.users;
		}
		
		override public function destroy():void {
			super.destroy();
			//view.dispose();
			view = null;
		}
	}
}
