package org.bigbluebutton.web.user.views {
	import flash.geom.Point;
	
	import mx.controls.Menu;
	import mx.events.MenuEvent;
	
	import org.bigbluebutton.lib.main.commands.ClearUserStatusSignal;
	import org.bigbluebutton.lib.main.commands.KickUserSignal;
	import org.bigbluebutton.lib.main.commands.LockUserSignal;
	import org.bigbluebutton.lib.main.commands.PresenterSignal;
	import org.bigbluebutton.lib.user.events.UserItemSelectedEvent;
	import org.bigbluebutton.lib.user.models.User;
	import org.bigbluebutton.lib.user.views.UsersViewMediatorBase;
	import org.bigbluebutton.lib.voice.commands.MicrophoneMuteSignal;
	import org.bigbluebutton.web.chat.models.ChatRoomVO;
	import org.bigbluebutton.web.main.models.IUISession;
	
	public class UserViewMediatorWeb extends UsersViewMediatorBase {
		
		[Inject]
		public var clearUserStatusSignal:ClearUserStatusSignal;
		
		[Inject]
		public var presenterSignal:PresenterSignal;
		
		[Inject]
		public var lockUserSignal:LockUserSignal;
		
		[Inject]
		public var micMuteSignal:MicrophoneMuteSignal;
		
		[Inject]
		public var kickUserSignal:KickUserSignal;
		
		[Inject]
		public var uiSession:IUISession;
		
		private var _selectedUser:User;
		
		private var _menu:Menu;
		
		private var _menuData:Array;
		
		private var _menuXY:Point;
		
		override protected function onUserItemSelected(e:UserItemSelectedEvent):void {
			trace("x", e.globalPos.x, "y", e.globalPos.y, "width", e.width, "height", e.height);
			_selectedUser = e.user;
			openUserMenu(e.globalPos.x + e.width, e.globalPos.y);
		}
		
		private function openUserMenu(x:Number, y:Number):void {
			_menuData = [];
			
			// private chat, clear status, make presenter, mute, lock, kick
			
			_menuData.push({label: 'Chat', handler: openPrivateChat});
			if (userSession.userList.me.isModerator()) {
				if (_selectedUser.status != User.NO_STATUS) {
					_menuData.push({label: 'Clear status', handler: clearUserStatus});
				}
				if (_selectedUser.presenter == false) {
					_menuData.push({label: 'Make presenter', handler: makeUserPresenter});
				}
				if (_selectedUser.voiceJoined && _selectedUser.muted == false) {
					_menuData.push({label: 'Mute user', handler: muteUser});
				}
				if (_selectedUser.role != User.MODERATOR) {
					_menuData.push({label: 'Lock user', handler: lockUser});
					_menuData.push({label: 'Kick user', handler: kickUser});
				}
			}
			
			// make sure the previous menu is closed before opening a new one
			// This could be improved to include a flag that tells if the menu is open,
			// but it would require an extra listener for the MenuCloseEvent.
			if (_menu) {
				_menu.removeEventListener(MenuEvent.ITEM_CLICK, menuClickHandler);
				_menu.removeEventListener(MenuEvent.MENU_SHOW, menuShowHandler);
				_menu.hide();
			}
			
			_menuXY = new Point(x, y);
			
			_menu = Menu.createMenu(null, _menuData, true);
			_menu.variableRowHeight = false;
			_menu.addEventListener(MenuEvent.ITEM_CLICK, menuClickHandler);
			_menu.addEventListener(MenuEvent.MENU_SHOW, menuShowHandler);
			_menu.show();
		}
		
		private function menuClickHandler(e:MenuEvent):void {
			if (_menuData[e.index] != undefined && _menuData[e.index].handler != undefined) {
				_menuData[e.index].handler();
			}
		}
		
		private function menuShowHandler(e:MenuEvent):void {
			_menu.setFocus();
			_menu.x = _menuXY.x;
			_menu.y = _menuXY.y;
		}
		
		private function openPrivateChat():void {
			uiSession.chatInfo = new ChatRoomVO(_selectedUser.userId, false);
		}
		
		private function clearUserStatus():void {
			clearUserStatusSignal.dispatch(_selectedUser.userId);
		}
		
		private function makeUserPresenter():void {
			presenterSignal.dispatch(_selectedUser, userSession.userList.me.userId);
		}
		
		private function muteUser():void {
			micMuteSignal.dispatch(_selectedUser);
		}
		
		private function lockUser():void {
			lockUserSignal.dispatch(_selectedUser.userId, !_selectedUser.locked);
		}
		
		private function kickUser():void {
			kickUserSignal.dispatch(_selectedUser);
		}
	}
}
