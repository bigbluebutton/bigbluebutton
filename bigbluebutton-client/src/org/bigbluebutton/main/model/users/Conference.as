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
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.Role;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.model.Config;
	import org.bigbluebutton.core.vo.CameraSettingsVO;
	import org.bigbluebutton.core.vo.LockSettingsVO;
	
	public class Conference {		
    public var meetingName:String;
    public var externalMeetingID:String;
    public var internalMeetingID:String;
    public var externalUserID:String;
    public var avatarURL:String;
	  public var voiceBridge:String;
	  public var dialNumber:String;
	  [Bindable] public var record:Boolean;
    
    private static const LOG:String = "main.model.users::Conference - ";
    
	  private var lockSettings:LockSettingsVO;
	
    private var _myCamSettings:CameraSettingsVO = new CameraSettingsVO();
    
		[Bindable] private var me:BBBUser = null;		
		[Bindable] public var users:ArrayCollection = null;			
		private var sort:Sort;
		
	  private var defaultLayout:String;
    
		public function Conference():void {
			me = new BBBUser();
			users = new ArrayCollection();
			sort = new Sort();
			sort.compareFunction = sortFunction;
			users.sort = sort;
			users.refresh();
		}
		
		// Custom sort function for the users ArrayCollection. Need to put dial-in users at the very bottom.
		private function sortFunction(a:Object, b:Object, array:Array = null):int {
			/*if (a.presenter)
				return -1;
			else if (b.presenter)
				return 1;*/
			if (a.role == Role.MODERATOR && b.role == Role.MODERATOR) {
				if (a.raiseHand && b.raiseHand) {
					if (a.raiseHandTime < b.raiseHandTime) 
						return -1;
					else
						return 1;
				} else if (a.raiseHand)
					return -1;
				else if (b.raiseHand)
					return 1;
			} else if (a.role == Role.MODERATOR)
				return -1;
			else if (b.role == Role.MODERATOR)
				return 1;
			else if (a.raiseHand && b.raiseHand) {
				if (a.raiseHandTime < b.raiseHandTime) 
					return -1;
				else
					return 1;
			} else if (a.raiseHand)
				return -1;
			else if (b.raiseHand)
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
			trace("Adding new user [" + newuser.userID + "]");
			if (! hasUser(newuser.userID)) {
				trace("Am I this new user [" + newuser.userID + ", " + me.userID + "]");
				if (newuser.userID == me.userID) {
					newuser.me = true;
				}						
				
				users.addItem(newuser);
				users.refresh();
			}					
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
			
			if (moderatorCount == 1) return true;
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
				LogUtil.warn("User not found with id=" + userID);
				return false;
			}
			var a:BBBUser = user.participant as BBBUser;
			return a.presenter;
		}
			
		public function removeUser(userID:String):void {
			var p:Object = getUserIndex(userID);
			if (p != null) {
				trace("removing user[" + p.participant.name + "," + p.participant.userID + "]");				
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
					return {index:i, participant:aUser};
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
		}
		
        [Bindable]
        public function get isMyHandRaised():Boolean {
            return me.raiseHand;
        }
        
        public function set isMyHandRaised(raiseHand:Boolean):void {
            me.raiseHand = raiseHand;
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
		
		public function setMyCustomData(customdata:Object):void{
			me.customdata = customdata;
		}
		
		public function getMyCustomData():Object{
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
			users.removeAll();
		}		
	
    public function raiseHand(userId: String, raised: Boolean):void {
      var aUser:BBBUser = getUser(userId);			
      if (aUser != null) {
        aUser.userRaiseHand(raised)
      }	
      
      users.refresh();      
    }
    
    public function sharedWebcam(userId: String, stream: String):void {
      var aUser:BBBUser = getUser(userId);			
      if (aUser != null) {
        aUser.sharedWebcam(stream)
      }	
      
      users.refresh();      
    }
    
    public function unsharedWebcam(userId: String):void {
      var aUser:BBBUser = getUser(userId);			
      if (aUser != null) {
        aUser.unsharedWebcam()
      }	
      
      users.refresh();       
    }
    
    public function presenterStatusChanged(userId: String, presenter: Boolean):void {
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
			var config:Config = BBB.initConfigManager().config;
			
			var disableCam:Boolean,
			disableMic:Boolean,
			disablePrivateChat:Boolean,
			disablePublicChat:Boolean,
			lockedLayout:Boolean,
			lockOnJoin:Boolean;
			
			var lockConfig:XML;
			
			if (config!=null) {
				lockConfig = config.lock;
			}
			
			try {
				disableCam = (lockConfig.@disableCamForLockedUsers.toUpperCase() == "TRUE");
			} catch(e:Error) {
				disableCam = false; //If not set, default to false
			}
			
			try {
				disableMic = (lockConfig.@disableMicForLockedUsers.toUpperCase() == "TRUE");
			} catch(e:Error) {
				disableMic = false; //If not set, default to false
			}
			
			try {
				disablePrivateChat = (lockConfig.@disablePrivateChatForLockedUsers.toUpperCase() == "TRUE");
			} catch(e:Error) {
				disablePrivateChat = false; //If not set, default to false
			}
			
			try {
				disablePublicChat = (lockConfig.@disablePublicChatForLockedUsers.toUpperCase() == "TRUE");
			} catch(e:Error) {
				disablePublicChat = false; //If not set, default to false
			}
			
			try {
				lockedLayout = (lockConfig.@lockLayoutForLockedUsers.toUpperCase() == "TRUE");
			} catch(e:Error) {
				lockedLayout = false; //If not set, default to false
			}
			
			try {
				lockOnJoin = (lockConfig.@lockOnJoin.toUpperCase() == "TRUE");
			} catch(e:Error) {
				lockOnJoin = true; //If not set, default to true
			}
      
      trace(LOG + " init lock settings from config");
      
			lockSettings = new LockSettingsVO(disableCam, disableMic, disablePrivateChat, disablePublicChat, lockedLayout, lockOnJoin);
      
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
		}
    
    public function applyLockSettings():void {
      for (var i:int = 0; i < users.length; i++) {
        var eachUser:BBBUser = users.getItemAt(i) as BBBUser;
        eachUser.applyLockSettings();
      }      
    }
	}
}
