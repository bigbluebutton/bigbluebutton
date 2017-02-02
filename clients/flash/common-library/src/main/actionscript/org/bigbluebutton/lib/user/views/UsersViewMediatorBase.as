package org.bigbluebutton.lib.user.views {
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.lib.main.models.IUserSession;
	import org.bigbluebutton.lib.user.events.UserItemSelectedEvent;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class UsersViewMediatorBase extends Mediator {
		
		[Inject]
		public var view:UsersViewBase;
		
		[Inject]
		public var userSession:IUserSession;
		
		private var _userCollection:ArrayCollection;
		
		override public function initialize():void {
			_userCollection = userSession.userList.users;
			view.userList.dataProvider = _userCollection;
			
			view.userList.addEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
		}
		
		protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			// leave the implementation to the specific client
		}
		
		override public function destroy():void {
			view.userList.removeEventListener(UserItemSelectedEvent.SELECTED, onUserItemSelected);
			
			super.destroy();
			view = null;
		}
	}
}
