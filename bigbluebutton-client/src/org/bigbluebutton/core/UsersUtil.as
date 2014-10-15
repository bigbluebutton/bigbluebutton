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
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.managers.UserManager;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.main.model.users.BBBUser;

  public class UsersUtil
  {
    
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
    
    public static function amIPublishing():CameraSettingsVO {
     return UserManager.getInstance().getConference().amIPublishing();
    }
    
    public static function setIAmPublishing(publishing:Boolean):void {
      UserManager.getInstance().getConference().setCamPublishing(publishing);
    }
    
    public static function setCameraSettings(camSettings:CameraSettingsVO):void {
      UserManager.getInstance().getConference().setCameraSettings(camSettings);
    }
    
    public static function hasWebcamStream(userID:String):Boolean {
      var u:BBBUser = getUser(userID);
      if (u != null) {
        return u.hasStream;
      }
      
      return false;
    }
    
    public static function getWebcamStream(userID:String):String {
      var u:BBBUser = getUser(userID);
      if (u != null && u.hasStream) {
        return u.streamName;
      }
      
      return null;
    }
    
    public static function getUserIDs():ArrayCollection {
      return UserManager.getInstance().getConference().getUserIDs();
    }
    
    public static function getInternalMeetingID():String {
      return UserManager.getInstance().getConference().internalMeetingID;
    }
    
    public static function getAvatarURL():String {
      return UserManager.getInstance().getConference().avatarURL;
    }
	
	public static function getVoiceBridge():String {
		return UserManager.getInstance().getConference().voiceBridge;
	}
	
	public static function getDialNumber():String {
		return UserManager.getInstance().getConference().dialNumber;
	}
	
	public static function getCustomData():Object {
		return UserManager.getInstance().getConference().getMyCustomData();
	}
    
    public static function getExternalMeetingID():String {
      return UserManager.getInstance().getConference().externalMeetingID;
    }
    
    public static function amIModerator():Boolean {
      return UserManager.getInstance().getConference().amIModerator();
    }
    
    public static function amIPresenter():Boolean {
      return UserManager.getInstance().getConference().amIPresenter;
    }
        
    public static function hasUser(userID:String):Boolean {
      return UserManager.getInstance().getConference().hasUser(userID);
    }
    
    public static function getUser(userID:String):BBBUser {
      return UserManager.getInstance().getConference().getUser(userID);
    }
    
    public static function isMe(userID:String):Boolean {
      return UserManager.getInstance().getConference().amIThisUser(userID);
    }
    
    public static function getMyExternalUserID():String {
      return UserManager.getInstance().getConference().getMyExternalUserID();
    }
    
    public static function getMyUserID():String {
      return UserManager.getInstance().getConference().getMyUserId();
    }
    
    public static function getMyRole():String {
      return UserManager.getInstance().getConference().getMyRole();
    }
    
    public static function getMyUsername():String {
      return UserManager.getInstance().getConference().getMyName();
    }
    
    public static function internalUserIDToExternalUserID(userID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
      if (user != null) {
        LogUtil.debug("Found externUserID [" + user.externUserID + "] for userID [" + userID + "]");
        return user.externUserID;
      }
      LogUtil.warn("Could not find externUserID for userID [" + userID + "]");
      trace("Could not find externUserID for userID [" + userID + "]");
      return "";
    }
    
    public static function externalUserIDToInternalUserID(externUserID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUserWithExternUserID(externUserID);
      if (user != null) {
        LogUtil.debug("Found userID [" + user.userID + "] for externUserID [" + externUserID + "]");
        return user.userID;
      }
      LogUtil.warn("Could not find userID for externUserID [" + externUserID + "]");
      return null;
    }    
    
    public static function getUserName(userID:String):String {
      var user:BBBUser = UserManager.getInstance().getConference().getUser(userID);
      if (user != null) {
        return user.name;
      }
      return null;
    }
    
  }
}