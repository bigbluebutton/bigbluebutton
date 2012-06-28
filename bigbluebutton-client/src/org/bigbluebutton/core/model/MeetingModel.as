/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
*/
package org.bigbluebutton.core.model {
	import flash.events.IEventDispatcher;
	
	import mx.collections.ArrayCollection;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.controllers.events.GotAllUsersEvent;
	import org.bigbluebutton.core.controllers.events.SwitchPresenterEvent;
	import org.bigbluebutton.core.controllers.events.UserEvent;
	import org.bigbluebutton.core.controllers.events.UserLeftEvent;
	import org.bigbluebutton.core.controllers.events.UserStatusChangeEvent;
	import org.bigbluebutton.core.vo.Status;
	import org.bigbluebutton.core.vo.User;

	public class MeetingModel  {	
        private var _dispatcher:IEventDispatcher;        
		private var _myUserid:String;		
		private var _me:User = new User();		
		private var _users:ArrayCollection = new ArrayCollection();			
		
        public function MeetingModel(dispatcher:IEventDispatcher) {
            _dispatcher = dispatcher;
        }
        
        public function set myUserID(userid:String):void {
            _myUserid = userid;
        }
        
        public function get myUserID():String {
            return _myUserid;
        }
        
		public function addAllUsers(u:ArrayCollection):void {
			for (var i:int = 0; i < u.length; i++) {
				addUser(User.copy(u.getItemAt(i) as User));
			}
            LogUtil.debug("Dispatching GotAllUsersEvent");
            _dispatcher.dispatchEvent(new GotAllUsersEvent());
		}
		
		public function addUser(newuser:User):void {				
			if (! hasUser(newuser.userid)) {				
				if (newuser.userid == _me.userid) {
					newuser.me = true;
				}						
				
				_users.addItem(newuser);
				sort();
			}					
		}

		public function hasUser(userid:String):Boolean {
			var p:Object = getUserIndex(userid);
			if (p != null) {
				return true;
			}
						
			return false;		
		}
		
		public function hasOnlyOneModerator():Boolean {
			var p:User;
			var moderatorCount:int = 0;
			
			for (var i:int = 0; i < _users.length; i++) {
				p = _users.getItemAt(i) as User;				
				if (p.role == Role.MODERATOR) {
					moderatorCount++;
				}
			}				
			
			if (moderatorCount == 1) return true;
			return false;			
		}
		
		public function getTheOnlyModerator():User {
			var p:User;
			for (var i:int = 0; i < _users.length; i++) {
				p = _users.getItemAt(i) as User;				
				if (p.role == Role.MODERATOR) {
					return User.copy(p);
				}
			}		
			
			return null;	
		}
		
		public function getPresenter():User {
			var p:User;
			for (var i:int = 0; i < _users.length; i++) {
				p = _users.getItemAt(i) as User;	
				if (isUserPresenter(p.userid)) {
					return User.copy(p);
				}
			}		
			
			return null;
		}
		
		public function getUser(userid:String):User {
			var p:Object = getUserIndex(userid);
			if (p != null) {
				return p.participant as User;
			}
						
			return null;				
		}

		public function isUserPresenter(userid:String):Boolean {
			var user:Object = getUserIndex(userid);
			if (user == null) {
				LogUtil.warn("User not found with id=" + userid);
				return false;
			}
			var a:User = user.participant as User;
			return a.presenter;
		}
			
		public function assignNewPresenter(newPresenter:String, assignedBy:String):void {
			var u:User = getUser(newPresenter);
			var cp:User = getPresenter();
			if (cp != null && u != null) {
				cp.presenter = false;
				u.presenter = true;
			}
			
			var event:SwitchPresenterEvent = new SwitchPresenterEvent();
			event.newPresenter = newPresenter;
			event.oldPresenter = cp.userid;
			event.assignedBy = assignedBy;
            _dispatcher.dispatchEvent(event);
		}
		
		public function removeUser(userid:String):void {
			var index:int = getUserIndex(userid);
			if (index >= 0) {
                var u:User = _users.removeItemAt(index) as User;
				sort();
				
				var event:UserLeftEvent = new UserLeftEvent();
				event.userId = u.userid;
				event.name = u.name;
                _dispatcher.dispatchEvent(event);
			}							
		}
		
		/**
		 * Get the index number of the participant with the specific userid 
		 * @param userid
		 * @return -1 if participant not found
		 * 
		 */		
		private function getUserIndex(userid:String):int {
			var aUser:User;
			
			for (var i:int = 0; i < _users.length; i++) {
				aUser = _users.getItemAt(i) as User;
				
				if (aUser.userid == userid) {
					return i;
				}
			}				
			
			// Participant not found.
			return -1;
		}
	
		public function amIPresenter():Boolean {
			return _me.presenter;
		}
		
		public function setMePresenter(presenter:Boolean):void {
            _me.presenter = presenter;
		}
				
		public function amIThisUser(userid:String):Boolean {
			return _me.userid == userid;
		}
				
		public function amIModerator():Boolean {
			return _me.role == Role.MODERATOR;
		}

		public function muteMyVoice(mute:Boolean):void {
			voiceMuted = mute;
		}
		
		public function isMyVoiceMuted():Boolean {
			return _me.voiceMuted;
		}
		
		[Bindable]
		public function set voiceMuted(m:Boolean):void {
            _me.voiceMuted = m;
		}
		
		public function get voiceMuted():Boolean {
			return _me.voiceMuted;
		}
		
		public function setMyVoiceUserId(userid:int):void {
            _me.voiceUserid = userid;
		}
		
		public function getMyVoiceUserId():Number {
			return _me.voiceUserid;
		}
		
		public function amIThisVoiceUser(userid:int):Boolean {
			return _me.voiceUserid == userid;
		}
		
		public function setMyVoiceJoined(joined:Boolean):void {
			voiceJoined = joined;
		}
		
		public function amIVoiceJoined():Boolean {
			return _me.voiceJoined;
		}
		
		/** Hook to make the property Bindable **/
		[Bindable]
		public function set voiceJoined(j:Boolean):void {
            _me.voiceJoined = j;			
		}
		
		public function get voiceJoined():Boolean {
			return _me.voiceJoined;
		}
		
		[Bindable]
		public function set voiceLocked(locked:Boolean):void {
            _me.voiceLocked = locked;
		}
		
		public function get voiceLocked():Boolean {
			return _me.voiceLocked;
		}
		
		public function getMyUserId():String {
			return _me.userid;
		}
		public function setMyUserid(userid:String):void {
            _me.userid = userid;
		}
		
		public function setMyName(name:String):void {
            _me.name = name;
		}
		
		public function getMyName():String {
			return _me.name;
		}
		
		public function setMyRole(role:String):void {
            _me.role = role;
		}
		
		public function setMyRoom(room:String):void {
            _me.room = room;
		}
		
		public function setMyAuthToken(token:String):void {
            _me.authToken = token;
		}
		
		public function removeAllParticipants():void {
			_users.removeAll();
		}		
	
		public function newUserStatus(id:String, status:String, value:Object):void {
			var aUser:User = getUser(id);	
			if (aUser != null) {
                var event:UserStatusChangeEvent = new UserStatusChangeEvent();
                event.oldStatus = aUser.getStatus(status);
                
				var s:Status = new Status(status, value);
				aUser.changeStatus(s);
                                
                event.newStatus = aUser.getStatus(status);
                event.userid = id;
                _dispatcher.dispatchEvent(event);
			}	
			
			sort();		

		}
		
		/**
		 * Sorts the users by name 
		 * 
		 */		
		private function sort():void {
			_users.source.sortOn("name", Array.CASEINSENSITIVE);	
			_users.refresh();				
		}				
	}
}