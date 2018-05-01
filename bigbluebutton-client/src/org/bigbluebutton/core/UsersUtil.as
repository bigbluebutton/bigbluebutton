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
package org.bigbluebutton.core
{
  import com.asfusion.mate.events.Dispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.events.LockControlEvent;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.model.users.User2x;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.main.model.options.LockOptions;
  import org.bigbluebutton.main.model.users.BreakoutRoom;
  
  public class UsersUtil
  {
    
	private static const LOGGER:ILogger = getClassLogger(UsersUtil);

    public static function isUserLeaving(userID:String):Boolean {
      var user:User2x = getUser2x(userID);
      if (user != null) {
        return user.isLeavingFlag;
      }
      
      return true;      
    }
    
    public static function getPresenterUserID():String {
      var presenter:User2x = LiveMeeting.inst().users.getPresenter();
      if (presenter != null) {
        return presenter.intId;
      }
      
      return "";
    }
    
    public static function getPresenter(): User2x {
      return LiveMeeting.inst().users.getPresenter();
    }
    
    public static function isUserJoinedToVoice(userId:String):Boolean {
      var u:VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(userId);
      if (u != null) {
        return true;
      }
      
      return false;
    }
    
	public static function setUserEjected():void {
    LiveMeeting.inst().me.ejectedFromMeeting = true;
	}
	
	public static function isUserEjected():Boolean {
    return LiveMeeting.inst().me.ejectedFromMeeting;
	}
	
  public static function isRecorded():Boolean {
    return LiveMeeting.inst().meeting.recorded;
  }
  
    public static function myCamSettings():ArrayCollection {
     return LiveMeeting.inst().me.myCamSettings() as ArrayCollection;
    }

    public static function addCameraSettings(camSettings:CameraSettingsVO):void {
      LiveMeeting.inst().me.addCameraSettings(camSettings);
    }

    public static function removeCameraSettings(camIndex:int):void {
      LiveMeeting.inst().me.removeCameraSettings(camIndex);
    }

    public static function hasWebcamStream(userId:String):Boolean {
      var streams:Array = LiveMeeting.inst().webcams.getStreamsForUser(userId);
      if (streams.length > 0) {
        return true;
      }
      
      return false;
    }
    
    public static function getWebcamStreamsFor(userId:String):Array {
      return LiveMeeting.inst().webcams.getStreamsForUser(userId);
    }
    
    public static function setDefaultLayout(defaultLayout:String):void {
      LiveMeeting.inst().meeting.defaultLayout = defaultLayout;
    }
    
    public static function getDefaultLayout():String {
      return LiveMeeting.inst().meeting.defaultLayout;
    }
    
    public static function getUserIDs():Array {
      return LiveMeeting.inst().users.getUserIds();
    }
    
    public static function getInternalMeetingID():String {
      return LiveMeeting.inst().meeting.internalId;
    }
    
    public static function getAvatarURL():String {
      return LiveMeeting.inst().me.avatarURL; 
    }

    public static function getUserAvatarURL(userId:String):String {
       return LiveMeeting.inst().users.getAvatar(userId);
    }	
	
	public static function getVoiceBridge():String {
		return LiveMeeting.inst().meeting.voiceConf;
	}
	
	public static function getDialNumber():String {
		return LiveMeeting.inst().meeting.dialNumber;
	}
	
	public static function getCustomData():Object {
		return LiveMeeting.inst().me.customData;
	}
  
  public static function getMeetingName():String {
    return LiveMeeting.inst().meeting.name;
  }  
  
    public static function getExternalMeetingID():String {
      return LiveMeeting.inst().meeting.externalId;
    }
    
    public static function amIModerator():Boolean {
      return LiveMeeting.inst().me.role == Role.MODERATOR;
    }
    
    public static function amIPresenter():Boolean {
      return LiveMeeting.inst().me.isPresenter;
    }
    
    public static function isBreakout():Boolean {
      return LiveMeeting.inst().meeting.isBreakout;
    }
    
    public static function amIMuted():Boolean {
      return LiveMeeting.inst().me.muted;
    }
    
    public static function iAskedToLogout():Boolean {
      return LiveMeeting.inst().me.iAskedToLogout;
    }
    
    public static function newUserRoleForUser(userId: String, role: String): void {
      LiveMeeting.inst().users.setRoleForUser(userId, role);
    }
    
    public static function setMyRole(role: String): void {
      LiveMeeting.inst().me.role = role;
    }
    
    public static function setIAskedToLogout(value:Boolean): void {
      LiveMeeting.inst().me.iAskedToLogout = value;
    }

    public static function setUserAsPresent(userId: String, value: Boolean): void {
      if (userId == LiveMeeting.inst().me.id) {
        LiveMeeting.inst().me.isPresenter = value;
      }
      var user: User2x = LiveMeeting.inst().users.getUser(userId);
      user.presenter = value;
      applyLockSettings();
    }

    public static function amIinVoiceConf(): Boolean {
      var myVoiceUser: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(LiveMeeting.inst().me.id);
      if (myVoiceUser != null) return true;
      return false;
    }
    
    public static function amIWaitingForAcceptance():Boolean {
      return LiveMeeting.inst().me.waitingForApproval;
    }
        
    public static function hasUser(userId:String):Boolean {
      return getUser(userId) != null;
    }
    
    public static function getUsers(): ArrayCollection {
      return LiveMeeting.inst().users.getUsers();
    }
    
    public static function getUser(userID:String):User2x {
      return LiveMeeting.inst().users.getUser(userID);
    }
    
    public static function getUser2x(userId:String):User2x {
      return LiveMeeting.inst().users.getUser(userId);
    }

    public static function getMyself():User2x {
      return getUser2x(LiveMeeting.inst().me.id);
    }
    
    public static function isMe(userID:String):Boolean {
      return LiveMeeting.inst().me.id == userID;
    }
    
    public static function getMyExternalUserID():String {
      return LiveMeeting.inst().me.externalId;
    }
    
    public static function getMyUserID():String {
      return LiveMeeting.inst().me.id;
    }
    
    public static function getMyRole():String {
      return LiveMeeting.inst().me.role;
    }
    
    public static function setMeMuted(muted: Boolean): void {
      LiveMeeting.inst().me.muted = muted;
    }
    
    public static function getMyUsername():String {
      return LiveMeeting.inst().me.name;
    }
    
    public static function myEmoji():String {
      return LiveMeeting.inst().me.emoji;
    }
    
    public static function setMyEmoji(value: String):void {
      LiveMeeting.inst().me.emoji = value;
    }
    
    public static function internalUserIDToExternalUserID(userID:String):String {
      var user:User2x = LiveMeeting.inst().users.getUser(userID);
      if (user != null) {
        return user.extId;
      }
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["user-util"];
			logData.userId = userID;
      logData.logCode = "ext_userid_not_found";
      LOGGER.warn(JSON.stringify(logData));
      return "";
    }
    
    public static function externalUserIDToInternalUserID(externUserID:String):String {
      var user:User2x = LiveMeeting.inst().users.getUserWithExtId(externUserID);
      if (user != null) {
        return user.intId;
      }
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["user-util"];
			logData.extUserId = externUserID;
			logData.logCode = "int_userid_not_found";
      LOGGER.warn(JSON.stringify(logData));
      return null;
    }    
    
    public static function getUserName(userID:String):String {
      var user:User2x = LiveMeeting.inst().users.getUser(userID);
      if (user != null) {
        return user.name;
      }
      return null;
    }
    
    private static function getUserData():Object {
      var userData:Object = new Object();
      userData.meetingId = getInternalMeetingID();
      userData.externalMeetingId = getExternalMeetingID();
      userData.meetingName = LiveMeeting.inst().meeting.name;
      userData.userId = getMyUserID();
      userData.username = getMyUsername();
      
      return userData;
    }
	
	public static function isAnyoneLocked():Boolean {
		return LiveMeeting.inst().users.isAnyUserLocked();
	}
    
    
    public static function initLogData():Object {
        var logData:Object = new Object();
        if (getInternalMeetingID() != null) {
            logData.user = UsersUtil.getUserData();
        }
        logData.sessionToken = getUserSession();
				logData.connections = BBB.initConnectionManager().getConnectionIds();
				
				var now:Date = new Date();
				logData.utcTime = now.getTime();
				logData.tzOffsetMin = now.getTimezoneOffset();
        return logData;
    }
    
    public static function getUserSession():String {
        return BBB.getQueryStringParameters().getSessionToken();
    }
    
    public static function applyLockSettings():void {
        LiveMeeting.inst().me.applyLockSettings();
    }
    
    public static function getLockSettings():LockSettingsVO {
      return LiveMeeting.inst().meetingStatus.lockSettings;
    }
    
    public static function setLockSettings(lockSettings:LockSettingsVO):void {
      LiveMeeting.inst().meetingStatus.lockSettings = lockSettings;
      applyLockSettings();
    }
    
    public static function lockSettingsNotInitialized():void {
      var lockOptions:LockOptions = Options.getOptions(LockOptions) as LockOptions;
      var lockSettings:LockSettingsVO = new LockSettingsVO(lockOptions.disableCam, lockOptions.disableMic,
        lockOptions.disablePrivateChat, lockOptions.disablePublicChat,
        lockOptions.lockedLayout, lockOptions.lockOnJoin,
        lockOptions.lockOnJoinConfigurable);
      var event:LockControlEvent = new LockControlEvent(LockControlEvent.SAVE_LOCK_SETTINGS);
      event.payload = lockSettings.toMap();
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(event);
    }
    
    public static function getBreakoutRoom(id: String): BreakoutRoom {
      return LiveMeeting.inst().breakoutRooms.getBreakoutRoom(id);
    }
  }
}
