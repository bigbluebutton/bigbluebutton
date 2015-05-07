package org.bigbluebutton.air.users.views {
	
	import flash.events.MouseEvent;
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.common.utils.PagesENUM;
	import org.bigbluebutton.air.common.utils.TransitionAnimationENUM;
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.main.models.IUserUISession;
	import org.bigbluebutton.lib.user.models.User;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UserDetailsViewMediator extends Mediator {
		
		[Inject]
		public var view:IUserDetailsView;
		
		[Inject]
		public var userSession:IUserSession;
		
		[Inject]
		public var userUISession:IUserUISession;
		
		protected var _user:User;
		
		override public function initialize():void {
			_user = userUISession.currentPageDetails as User;
			userSession.userList.userChangeSignal.add(userChanged);
			userSession.userList.userRemovedSignal.add(userRemoved);
			view.user = _user;
			view.showCameraButton.addEventListener(MouseEvent.CLICK, onShowCameraButton);
			view.showPrivateChat.addEventListener(MouseEvent.CLICK, onShowPrivateChatButton);
			FlexGlobals.topLevelApplication.pageName.text = view.user.name;
			FlexGlobals.topLevelApplication.backBtn.visible = true;
			FlexGlobals.topLevelApplication.profileBtn.visible = false;
		}
		
		protected function onShowCameraButton(event:MouseEvent):void {
			userUISession.pushPage(PagesENUM.VIDEO_CHAT, _user, TransitionAnimationENUM.APPEAR);
		}
		
		protected function onShowPrivateChatButton(event:MouseEvent):void {
			userUISession.pushPage(PagesENUM.CHAT, _user, TransitionAnimationENUM.APPEAR);
		}
		
		private function userRemoved(userID:String):void {
			if (_user.userID == userID) {
				userUISession.popPage(TransitionAnimationENUM.APPEAR);
			}
		}
		
		private function userChanged(user:User, type:int):void {
			if (_user.userID == user.userID) {
				view.update();
			}
		}
		
		override public function destroy():void {
			super.destroy();
			view.showCameraButton.removeEventListener(MouseEvent.CLICK, onShowCameraButton);
			view.showPrivateChat.removeEventListener(MouseEvent.CLICK, onShowPrivateChatButton);
			userSession.userList.userChangeSignal.remove(userChanged);
			userSession.userList.userRemovedSignal.remove(userRemoved);
			view.dispose();
			view = null;
		}
	}
}
