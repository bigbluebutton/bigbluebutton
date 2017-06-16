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
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.common.Role;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.model.users.BBBUser;
  import org.bigbluebutton.util.SessionTokenUtil;
  
  public class UsersUtil
  {
    
	private static const LOGGER:ILogger = getClassLogger(UsersUtil);

    public static function isUserLeaving(userID:String):Boolean {
      var user:BBBUser = getUser(userID);
      if (user != null) {
        return user.isLeavingFlag;
      }
      
      return true;      
    }
    
    public static function getPresenterUserID():String {
      var presenter:BBBUser = UserManager.getInstance().getConference().getPresenter();
      if (presenter != null) {
        return presenter.userID;
      }
      
      return "";
    }
    
    public static function isUserJoinedToVoice(userID:String):Boolean {
      var u:BBBUser = getUser(userID);
      if (u != null) {
        return u.voiceJoined;
      }
      
      return false;
    }
    
	public static function setUserEjected():void {
    LiveMeeting.inst().myStatus.userEjectedFromMeeting = true;
	}
	
	public static function isUserEjected():Boolean {
    return LiveMeeting.inst().myStatus.userEjectedFromMeeting;
	}
	
  public static function isRecorded():Boolean {
    return LiveMeeting.inst().meeting.recorded;
  }
  
    public static function amIPublishing():ArrayCollection {
     return UserManager.getInstance().getConference().amIPublishing() as ArrayCollection;
    }

    public static function addCameraSettings(camSettings:CameraSettingsVO):void {
      UserManager.getInstance().getConference().addCameraSettings(camSettings);
    }

    public static function removeCameraSettings(camIndex:int):void {
      UserManager.getInstance().getConference().removeCameraSettings(camIndex);
    }

    public static function hasWebcamStream(userID:String):Boolean {
      var u:BBBUser = getUser(userID);
      if (u != null) {
        return u.hasStream;
      }
      
      return false;
    }
    
    public static function getWebcamStream(userID:String):Array {
      var u:BBBUser = getUser(userID);
      if (u != null && u.hasStream) {
        return u.streamNames;
      }
      
      return null;
    }
    
    public static function getUserIDs():ArrayCollection {
      return UserManager.getInstance().getConference().getUserIDs();
    }
    
    public static function getInternalMeetingID():String {
      return LiveMeeting.inst().meeting.internalId;
    }
    
    public static function getAvatarURL():String {
      return LiveMeeting.inst().me.avatarURL; 
    }

    public static function getUserAvatarURL(userID:String):String {
       return UserManager.getInstance().getConference().getUserAvatarURL(userID);
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
      return LiveMeeting.inst().myStatus.isPresenter;
    }
    
    public static function isBreakout():Boolean {
      return LiveMeeting.inst().meeting.isBreakout;
    }
    
    public static function isMyVoiceMuted():Boolean {
      return LiveMeeting.inst().myStatus.voiceMuted;
    }
    
    public static function iAskedToLogout():Boolean {
      return LiveMeeting.inst().myStatus.iAskedToLogout;
    }
    
    public static function setIAskedToLogout(value:Boolean): void {
      LiveMeeting.inst().myStatus.iAskedToLogout = value;
    }
    
    
    public static function setMeAsPresenter(value: Boolean): void {
      LiveMeeting.inst().myStatus.isPresenter = value;
      applyLockSettings();
    }

    public static function amIWaitingForAcceptance():Boolean {
      return LiveMeeting.inst().myStatus.waitingForAcceptance;
    }
        
    public static function hasUser(userID:String):Boolean {
      return UserManager.getInstance().getConference().hasUser(userID);
    }
    
    public static function getUser(userID:String):BBBUser {
      return UserManager.getInstance().getConference().getUser(userID);
    }

    public static function getMyself():BBBUser {
      return UserManager.getInstance().getConference().getMyUser();
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
    
    public static function getMyUsername():String {
      return LiveMeeting.inst().me.name;
    }
    
    public static function myEmoji():String {
      return LiveMeeting.inst().myStatus.myEmojiStatus;
    }
    
    public static function setMyEmoji(value: String):void {
      LiveMeeting.inst().myStatus.myEmojiStatus = value;
    }
    
    public static function internalUserIDToExternalUserID(userID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
      if (user != null) {
        return user.externUserID;
      }
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["user-util"];
      logData.message = "Could not find externUserID for userID:".concat(userID);
      LOGGER.warn(JSON.stringify(logData));
      return "";
    }
    
    public static function externalUserIDToInternalUserID(externUserID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUserWithExternUserID(externUserID);
      if (user != null) {
        return user.userID;
      }
      var logData:Object = UsersUtil.initLogData();
      logData.tags = ["user-util"];
      logData.message = "Could not find userID for externUserID:".concat(externUserID);
      LOGGER.warn(JSON.stringify(logData));
      return null;
    }    
    
    public static function getUserName(userID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
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
		var users:ArrayCollection = UserManager.getInstance().getConference().users;
		for(var i:uint = 0; i<users.length; i++) {
			var user:BBBUser = users.getItemAt(i) as BBBUser;
			if(user.userLocked)
				return true;
		}
		return false;
	}
    
    
    public static function initLogData():Object {
        var logData:Object = new Object();
        if (getInternalMeetingID() != null) {
            logData.user = UsersUtil.getUserData();
        }
        logData.sessionToken = getUserSession();
        return logData;
    }
    
    public static function getUserSession():String {
        var sessionUtil:SessionTokenUtil = new SessionTokenUtil()
        return sessionUtil.getSessionToken();
    }
    
    public static function applyLockSettings():void {
      var myUser:BBBUser = getMyself();
      if (myUser != null)
        myUser.applyLockSettings();
    }
    
  }
}
