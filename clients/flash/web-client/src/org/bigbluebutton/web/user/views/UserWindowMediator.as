package org.bigbluebutton.web.user.views {
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.services.IUsersService;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UserWindowMediator extends Mediator {
		
		[Inject]
		public var view:UserWindow;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var usersService:IUsersService;
		
		override public function initialize():void {
			view.usersGrid.amIModerator = userSession.userList.me.role == User.MODERATOR;
			view.usersGrid.dataProvider = userSession.userList.users;
			view.lowerHandSignal.add(onLowerHandSignal);
			view.changePresenterSignal.add(onChangePresenterSignal);
			view.changeMuteSignal.add(onChangeMuteSignal);
			view.kickUserSignal.add(onKickUserSignal);
		}
		
		public function onLowerHandSignal(userID:String):void {
			usersService.lowerHand(userID);
		}
		
		public function onChangePresenterSignal(userID:String):void {
			usersService.assignPresenter(userID, "temp");
		}
		
		public function onChangeMuteSignal(userID:String, mute:Boolean):void {
			usersService.muteUnmuteUser(userID, mute);
		}
		
		public function onKickUserSignal(userID:String):void {
			usersService.kickUser(userID);
		}
		
		override public function destroy():void {
			super.destroy();
			view.lowerHandSignal.remove(onLowerHandSignal);
			view.changePresenterSignal.remove(onChangePresenterSignal);
			view.changeMuteSignal.remove(onChangeMuteSignal);
			view.kickUserSignal.remove(onKickUserSignal);
			view = null;
		}
	}
}
