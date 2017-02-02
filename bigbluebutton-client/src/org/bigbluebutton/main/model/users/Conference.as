 /**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
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
package org.bigbluebutton.main.model.users {
	
	import mx.collections.ArrayCollection;
	import mx.collections.Sort;
	import mx.collections.SortField;
	
	import org.as3commons.lang.ArrayUtils;
	import org.as3commons.lang.StringUtils;
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.model.Config;
	import org.bigbluebutton.core.vo.CameraSettingsVO;
	import org.bigbluebutton.core.vo.LockSettingsVO;
	
	public class Conference {
		public var userEjectedFromMeeting:Boolean = false;
		public var meetingName:String;
		
		public var externalMeetingID:String;
		
		public var internalMeetingID:String;
		
		public var externalUserID:String;
		
		public var avatarURL:String;
		
		public var voiceBridge:String;
		
		public var dialNumber:String;
		
		public var isBreakout:Boolean;
		
		[Bindable]
		public var record:Boolean;
		
		private static const LOGGER:ILogger = getClassLogger(Conference);
		
		private var lockSettings:LockSettingsVO;
		
		private var _myCamSettings:CameraSettingsVO = new CameraSettingsVO();
		
		[Bindable]
		private var me:BBBUser = null;
		
		[Bindable]
		public var users:ArrayCollection = null;
		
		[Bindable]
		public var breakoutRooms:ArrayCollection = null;
		
		[Bindable]
		public var breakoutRoomsReady:Boolean = false;
		
		private var sort:Sort;
		
		private var defaultLayout:String;
		
		public function Conference():void {
			me = new BBBUser();
			users = new ArrayCollection();
			sort = new Sort();
			sort.compareFunction = sortFunction;
			users.sort = sort;
			users.refresh();
			breakoutRooms = new ArrayCollection();
		}
		
		// Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			/*if (a.presenter)
			   return -1;
			   else if (b.presenter)
			   return 1;*/
			if (a.role == Role.MODERATOR && b.role == Role.MODERATOR) {
				if (a.hasEmojiStatus && b.hasEmojiStatus) {
					if (a.emojiStatusTime < b.emojiStatusTime)
						return -1;
					else
						return 1;
				} else if (a.hasEmojiStatus)
					return -1;
				else if (b.hasEmojiStatus)
					return 1;
			} else if (a.role == Role.MODERATOR)
				return -1;
			else if (b.role == Role.MODERATOR)
				return 1;
			else if (a.hasEmojiStatus && b.hasEmojiStatus) {
				if (a.emojiStatusTime < b.emojiStatusTime)
					return -1;
				else
					return 1;
			} else if (a.hasEmojiStatus)
				return -1;
			else if (b.hasEmojiStatus)
				return 1;
			else if (!a.phoneUser && !b.phoneUser) {
			} else if (!a.phoneUser)
				return -1;
			else if (!b.phoneUser)
				return 1;
			/*
			 * Check name (case-insensitive) in the event of a tie up above. If the name
			 * is the same then use userID which should be unique making the order the same
			 * across all clients.
			 */
			if (a.name.toLowerCase() < b.name.toLowerCase())
				return -1;
			else if (a.name.toLowerCase() > b.name.toLowerCase())
				return 1;
			else if (a.userID.toLowerCase() > b.userID.toLowerCase())
				return -1;
			else if (a.userID.toLowerCase() < b.userID.toLowerCase())
				return 1;
			return 0;
		}

		public function addUser(newuser:BBBUser):void {
			if (hasUser(newuser.userID)) {
				removeUser(newuser.userID);
			}
			if (newuser.userID == me.userID) {
				newuser.me = true;
			}
			users.addItem(newuser);
			users.refresh();
		}
		
		public function setCamPublishing(publishing:Boolean):void {
			_myCamSettings.isPublishing = publishing;
		}
		
		public function setCameraSettings(camSettings:CameraSettingsVO):void {
			_myCamSettings = camSettings;
		}
		
		public function amIPublishing():CameraSettingsVO {
			return _myCamSettings;
		}
		
		public function setDefaultLayout(defaultLayout:String):void {
			this.defaultLayout = defaultLayout;
		}

		public function getDefaultLayout():String {
			return defaultLayout;
		}

		public function hasUser(userID:String):Boolean {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				return true;
			}
			return false;
		}

		public function hasOnlyOneModerator():Boolean {
			var p:BBBUser;
			var moderatorCount:int = 0;
			for (var i:int = 0; i < users.length; i++) {
				p = users.getItemAt(i) as BBBUser;
				if (p.role == Role.MODERATOR) {
					moderatorCount++;
				}
			}
			if (moderatorCount == 1)
				return true;
			return false;
		}

		public function getTheOnlyModerator():BBBUser {
			var p:BBBUser;
			for (var i:int = 0; i < users.length; i++) {
				p = users.getItemAt(i) as BBBUser;
				if (p.role == Role.MODERATOR) {
					return BBBUser.copy(p);
				}
			}
			return null;
		}
		
		public function getPresenter():BBBUser {
			var p:BBBUser;
			for (var i:int = 0; i < users.length; i++) {
				p = users.getItemAt(i) as BBBUser;
				if (isUserPresenter(p.userID)) {
					return BBBUser.copy(p);
				}
			}
			return null;
		}

		public function getUser(userID:String):BBBUser {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				return p.participant as BBBUser;
			}
			return null;
		}

		public function getUserWithExternUserID(userID:String):BBBUser {
			var p:BBBUser;
			for (var i:int = 0; i < users.length; i++) {
				p = users.getItemAt(i) as BBBUser;
				if (p.externUserID == userID) {
					return BBBUser.copy(p);
				}
			}
			return null;
		}

		public function isUserPresenter(userID:String):Boolean {
			var user:Object = getUserIndex(userID);
			if (user == null) {
				return false;
			}
			var a:BBBUser = user.participant as BBBUser;
			return a.presenter;
		}

		public function removeUser(userID:String):void {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				users.removeItemAt(p.index);
				//sort();
				users.refresh();
			}
		}

		/**
		 * Get the index number of the participant with the specific userid
		 * @param userid
		 * @return -1 if participant not found
		 *
		 */
		private function getUserIndex(userID:String):Object {
			var aUser:BBBUser;
			for (var i:int = 0; i < users.length; i++) {
				aUser = users.getItemAt(i) as BBBUser;
				if (aUser.userID == userID) {
					return {index: i, participant: aUser};
				}
			}
			// Participant not found.
			return null;
		}
		
		public function whatsMyRole():String {
			return me.role;
		}
		
		[Bindable]
		public function get amIPresenter():Boolean {
			return me.presenter;
		}
		
		public function set amIPresenter(presenter:Boolean):void {
			me.presenter = presenter;
			applyLockSettings();
		}
		
		[Bindable]
		public function get myEmojiStatus():String {
			return me.emojiStatus;
		}
		
		public function set myEmojiStatus(emoji:String):void {
			me.emojiStatus = emoji;
		}
		
		public function amIThisUser(userID:String):Boolean {
			return me.userID == userID;
		}
		
		public function getMyRole():String {
			return me.role;
		}
		
		public function amIModerator():Boolean {
			return me.role == Role.MODERATOR;
		}
		
		public function muteMyVoice(mute:Boolean):void {
			voiceMuted = mute;
		}
		
		public function isMyVoiceMuted():Boolean {
			return me.voiceMuted;
		}
		
		[Bindable]
		public function set voiceMuted(m:Boolean):void {
			me.voiceMuted = m;
		}
		
		public function get voiceMuted():Boolean {
			return me.voiceMuted;
		}
		
		public function setMyVoiceJoined(joined:Boolean):void {
			voiceJoined = joined;
		}
		
		public function amIVoiceJoined():Boolean {
			return me.voiceJoined;
		}
		
		/** Hook to make the property Bindable **/
		[Bindable]
		public function set voiceJoined(j:Boolean):void {
			me.voiceJoined = j;
		}
		
		public function get voiceJoined():Boolean {
			return me.voiceJoined;
		}
		
		[Bindable]
		public function set locked(locked:Boolean):void {
			me.userLocked = locked;
		}
		
		public function get locked():Boolean {
			return me.userLocked;
		}
		
		public function setUserEjectedFromMeeting():void {
			userEjectedFromMeeting = true;
		}
		
		public function getUserEjectedFromMeeting():Boolean {
			return userEjectedFromMeeting;
		}
		
		public function getMyExternalUserID():String {
			return externalUserID;
		}
		
		public function getMyUserId():String {
			return me.userID;
		}
		
		public function setMyUserid(userID:String):void {
			me.userID = userID;
		}
		
		public function setMyName(name:String):void {
			me.name = name;
		}
		
		public function getMyName():String {
			return me.name;
		}
		
		public function setMyCustomData(customdata:Object):void {
			me.customdata = customdata;
		}
		
		public function getMyCustomData():Object {
			return me.customdata;
		}
		
		public function setMyRole(role:String):void {
			me.role = role;
		}
		
		public function setMyRoom(room:String):void {
			me.room = room;
		}
		
		public function setMyAuthToken(token:String):void {
			me.authToken = token;
		}
		
		public function removeAllParticipants():void {
			//users.removeAll();
			//users.refresh();
			for (var i:int = 0; i < users.length; i++) {
				users.removeItemAt(i);
				//sort();
				users.refresh();
			}
		}
		
		public function emojiStatus(userId:String, emoji:String):void {
			var aUser:BBBUser = getUser(userId);
			if (aUser != null) {
				aUser.userEmojiStatus(emoji)
			}
			users.refresh();
		}
		
		public function sharedWebcam(userId:String, stream:String):void {
			var aUser:BBBUser = getUser(userId);
			if (aUser != null) {
				aUser.sharedWebcam(stream)
			}
			users.refresh();
		}
		
		public function unsharedWebcam(userId:String, stream:String):void {
			var aUser:BBBUser = getUser(userId);
			if (aUser != null) {
				aUser.unsharedWebcam(stream);
			}
			users.refresh();
		}
		
		public function presenterStatusChanged(userId:String, presenter:Boolean):void {
			var aUser:BBBUser = getUser(userId);
			if (aUser != null) {
				aUser.presenterStatusChanged(presenter)
			}
			users.refresh();
		}
		
		public function newUserStatus(userID:String, status:String, value:Object):void {
			var aUser:BBBUser = getUser(userID);
			if (aUser != null) {
				var s:Status = new Status(status, value);
				aUser.changeStatus(s);
			}
			users.refresh();
		}
		
		public function getUserIDs():ArrayCollection {
			var uids:ArrayCollection = new ArrayCollection();
			for (var i:int = 0; i < users.length; i++) {
				var u:BBBUser = users.getItemAt(i) as BBBUser;
				uids.addItem(u.userID);
			}
			return uids;
		}
		
		/**
		 * Read default lock settings from config.xml
		 * */
		public function configLockSettings():void {
			var config:Config = BBB.getConfigManager().config;
			var disableCam:Boolean,
				disableMic:Boolean,
				disablePrivateChat:Boolean,
				disablePublicChat:Boolean,
				lockedLayout:Boolean,
				lockOnJoin:Boolean,
				lockOnJoinConfigurable:Boolean;
			var lockConfig:XML;
			if (config != null) {
				lockConfig = config.lock;
			}
			try {
				disableCam = (lockConfig.@disableCamForLockedUsers.toUpperCase() == "TRUE");
			} catch (e:Error) {
				disableCam = false; //If not set, default to false
			}
			try {
				disableMic = (lockConfig.@disableMicForLockedUsers.toUpperCase() == "TRUE");
			} catch (e:Error) {
				disableMic = false; //If not set, default to false
			}
			try {
				disablePrivateChat = (lockConfig.@disablePrivateChatForLockedUsers.toUpperCase() == "TRUE");
			} catch (e:Error) {
				disablePrivateChat = false; //If not set, default to false
			}
			try {
				disablePublicChat = (lockConfig.@disablePublicChatForLockedUsers.toUpperCase() == "TRUE");
			} catch (e:Error) {
				disablePublicChat = false; //If not set, default to false
			}
			try {
				lockedLayout = (lockConfig.@lockLayoutForLockedUsers.toUpperCase() == "TRUE");
			} catch (e:Error) {
				lockedLayout = false; //If not set, default to false
			}
			try {
				lockOnJoin = (lockConfig.@lockOnJoin.toUpperCase() == "TRUE");
			} catch (e:Error) {
				lockOnJoin = true; //If not set, default to true
			}
			try {
				lockOnJoinConfigurable = (lockConfig.@lockOnJoinConfigurable.toUpperCase() == "TRUE");
			} catch (e:Error) {
				lockOnJoinConfigurable = false; //If not set, default to false
			}
			lockSettings = new LockSettingsVO(disableCam, disableMic, disablePrivateChat, disablePublicChat, lockedLayout, lockOnJoin, lockOnJoinConfigurable);
			setLockSettings(lockSettings);
		}
		
		public function getMyUser():BBBUser {
			var eachUser:BBBUser;
			for (var i:int = 0; i < users.length; i++) {
				eachUser = users.getItemAt(i) as BBBUser;
				if (eachUser.userID == me.userID) {
					return eachUser;
				}
			}
			return null;
		}
		
		public function getLockSettings():LockSettingsVO {
			return lockSettings;
		}
		
		public function setLockSettings(lockSettings:LockSettingsVO):void {
			this.lockSettings = lockSettings;
			applyLockSettings();
			users.refresh(); // we need to refresh after updating the lock settings to trigger the user item renderers to redraw
		}
		
		public function applyLockSettings():void {
			var myUser:BBBUser = getMyUser();
			if (myUser != null)
				myUser.applyLockSettings();
		}
		
		/* Breakout room feature */
		public function addBreakoutRoom(newRoom:BreakoutRoom):void {
			if (hasBreakoutRoom(newRoom.meetingId)) {
				removeBreakoutRoom(newRoom.meetingId);
			}
			breakoutRooms.addItem(newRoom);
			sortBreakoutRooms();
		}
		
		private function sortBreakoutRooms() : void {
			var sort:Sort = new Sort();
			sort.fields = [new SortField("sequence", true, false, true)];
			breakoutRooms.sort = sort;
			breakoutRooms.refresh();
		}

		public function updateBreakoutRoomUsers(breakoutMeetingId:String, breakoutUsers:Array):void {
			var room:BreakoutRoom = getBreakoutRoom(breakoutMeetingId);
			if (room != null) {
				room.users = new ArrayCollection(breakoutUsers);
				var updateUsers:Array = [];
				// Update users breakout rooms
				var user:BBBUser;
				for (var i:int = 0; i < breakoutUsers.length; i++) {
					var userId:String = StringUtils.substringBeforeLast(breakoutUsers[i].id, "-");
					user = getUser(userId);
					if (user) {
						user.addBreakoutRoom(room.sequence)
					}
					updateUsers.push(userId);
				}
				// Remove users breakout rooms if the users left the breakout rooms
				for (var j:int = 0; j < users.length; j++) {
					user = BBBUser(users.getItemAt(j));
					if (updateUsers.indexOf(BBBUser(users.getItemAt(j)).userID) == -1 && ArrayUtils.contains(user.breakoutRooms, room.sequence)) {
						user.removeBreakoutRoom(room.sequence);
					}
				}
				users.refresh();
			}
		}

		/**
		 * Returns a breakout room by its internal meeting ID
		 */
		public function getBreakoutRoom(breakoutMeetingId:String):BreakoutRoom {
			var r:Object = getBreakoutRoomIndex(breakoutMeetingId);
			if (r != null) {
				return r.room as BreakoutRoom;
			}
			return null;
		}
		
		public function getBreakoutRoomByExternalId(externalId:String):BreakoutRoom {
			var aRoom:BreakoutRoom;
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				aRoom = breakoutRooms.getItemAt(i) as BreakoutRoom;
				if (aRoom.externalMeetingId == externalId) {
					return aRoom;
				}
			}
			return null;
		}
		
		public function getBreakoutRoomBySequence(sequence:int):BreakoutRoom {
			var aRoom:BreakoutRoom;
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				aRoom = breakoutRooms.getItemAt(i) as BreakoutRoom;
				if (aRoom.sequence == sequence) {
					return aRoom;
				}
			}
			return null;
		}

		/**
		 * Finds the index of a breakout room by its internal meeting ID
		 */
		public function getBreakoutRoomIndex(breakoutMeetingId:String):Object {
			var aRoom:BreakoutRoom;
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				aRoom = breakoutRooms.getItemAt(i) as BreakoutRoom;
				if (aRoom.meetingId == breakoutMeetingId) {
					return {index: i, room: aRoom};
				}
			}
			// Breakout room not found.
			return null;
		}

		public function removeBreakoutRoom(breakoutMeetingId:String):void {
			var room:Object = getBreakoutRoomIndex(breakoutMeetingId);
			if (room != null) {
				breakoutRooms.removeItemAt(room.index);
				sortBreakoutRooms();
				if (breakoutRooms.length == 0) {
					breakoutRoomsReady = false;
				}
				// Remove breakout room number display from users
				for (var i:int; i < users.length; i++) {
					if (ArrayUtils.contains(users[i].breakoutRooms, room.room.sequence)) {
						users[i].removeBreakoutRoom(room.room.sequence);
					}
				}
				users.refresh();
			}
		}

		public function hasBreakoutRoom(breakoutMeetingId:String):Boolean {
			var p:Object = getBreakoutRoomIndex(breakoutMeetingId);
			if (p != null) {
				return true;
			}
			return false;
		}
		
		public function setBreakoutRoomInListen(listen:Boolean, breakoutMeetingId:String):void {
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				var br:BreakoutRoom = BreakoutRoom(breakoutRooms.getItemAt(i));
				if (listen == false) {
					br.listenStatus = BreakoutRoom.NONE;
				} else if (listen == true && br.meetingId == breakoutMeetingId) {
					br.listenStatus = BreakoutRoom.SELF;
				} else {
					br.listenStatus = BreakoutRoom.OTHER;
				}
			}
		}
		
		public function getBreakoutRoomInListen() : BreakoutRoom {
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				var br:BreakoutRoom = BreakoutRoom(breakoutRooms.getItemAt(i));
				if (br.listenStatus == BreakoutRoom.SELF) {
					return br;
				}
			}
			return null;
		}

		public function resetBreakoutRooms():void {
			for (var i:int = 0; i < breakoutRooms.length; i++) {
				var br:BreakoutRoom = BreakoutRoom(breakoutRooms.getItemAt(i));
				br.listenStatus = BreakoutRoom.NONE;
			}
		}

		public function getUserAvatarURL(userID:String):String { // David, to get specific user avatar url
                        if(userID != null ){
                                var p:Object = getUserIndex(userID);
                                if (p != null) {
                                        var u:BBBUser = p.participant as BBBUser;
                                        LOGGER.info("getUserAvatarURL user =" + JSON.stringify(u));
                                        if(u.avatarURL == null || u.avatarURL == ""){
                                                return this.avatarURL;
                                        }
                                        return u.avatarURL;
                                }
                        }
                        return this.avatarURL;
               }
	}
}
