package org.bigbluebutton.air.main.views {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	import mx.resources.ResourceManager;
	
	import org.bigbluebutton.lib.main.commands.DisconnectUserSignal;
	import org.bigbluebutton.lib.main.commands.RaiseHandSignal;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.utils.DisconnectEnum;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.models.UserList;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class ProfileViewMediator extends Mediator {
		
		[Inject]
		public var view:IProfileView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var raiseHandSignal:RaiseHandSignal;
		
		[Inject]
		public var disconnectUserSignal:DisconnectUserSignal;
		
		override public function initialize():void {
			userSession.userList.userChangeSignal.add(userChangeHandler);
			var userMe:User = userSession.userList.me;
			view.userNameButton.label = userMe.name;
			view.raiseHandButton.label = ResourceManager.getInstance().getString('resources', userMe.raiseHand ? 'profile.settings.handLower' : 'profile.settings.handRaise');
			view.raiseHandButton.addEventListener(MouseEvent.CLICK, onRaiseHandClick);
			view.logoutButton.addEventListener(MouseEvent.CLICK, logoutClick);
			FlexGlobals.topLevelApplication.pageName.text = ResourceManager.getInstance().getString('resources', 'profile.title');
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
			FlexGlobals.topLevelApplication.backBtn.visible = true;
		}
		
		private function userChangeHandler(user:User, type:int):void {
			if (user.me && type == UserList.RAISE_HAND) {
				view.raiseHandButton.label = ResourceManager.getInstance().getString('resources', user.raiseHand ? 'profile.settings.handLower' : 'profile.settings.handRaise');
			}
		}
		
		protected function onRaiseHandClick(event:MouseEvent):void {
			raiseHandSignal.dispatch(userSession.userId, !userSession.userList.me.raiseHand);
		}
		
		/**
		 * User pressed log out button
		 */
		public function logoutClick(event:MouseEvent):void {
			userSession.logoutSignal.dispatch();
			disconnectUserSignal.dispatch(DisconnectEnum.CONNECTION_STATUS_USER_LOGGED_OUT);
		}
		
		override public function destroy():void {
			super.destroy();
			userSession.userList.userChangeSignal.remove(userChangeHandler);
			view.raiseHandButton.removeEventListener(MouseEvent.CLICK, onRaiseHandClick);
			view.logoutButton.removeEventListener(MouseEvent.CLICK, logoutClick);
			view.dispose();
			view = null;
		}
	}
}
