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
package org.bigbluebutton.core.model
{
  import com.asfusion.mate.events.Dispatcher; 
  import mx.collections.ArrayCollection; 
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.events.LockControlEvent;
  import org.bigbluebutton.core.events.VoiceConfEvent;
  import org.bigbluebutton.core.model.users.VoiceUser2x;
  import org.bigbluebutton.core.vo.CameraSettingsVO;
  import org.bigbluebutton.core.vo.LockSettingsVO;
  import org.bigbluebutton.modules.videoconf.events.ClosePublishWindowEvent;
 
  public class MyStatus {   
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
    
    public var disableMyCam:Boolean = false;
    public var disableMyMic:Boolean = false;
    public var disableMyPrivateChat:Boolean = false;
    public var disableMyPublicChat:Boolean = false;
    public var lockedLayout:Boolean = false;
    
    public var iAskedToLogout:Boolean;
    public var userEjectedFromMeeting:Boolean = false;
    
    public var userLocked: Boolean = false;
    public var voiceJoined: Boolean = false;
    public var voiceMuted: Boolean = false;
    
    public var isPresenter: Boolean = false;
    public var myEmojiStatus: String = "none";
    
    public var authTokenValid: Boolean = false;
    public var waitingForApproval: Boolean;
    
    private var _myCamSettings:ArrayCollection = new ArrayCollection();

    public function addCameraSettings(camSettings: CameraSettingsVO): void {
      if(!_myCamSettings.contains(camSettings)) {
        _myCamSettings.addItem(camSettings);
      }
    }
    
    public function removeCameraSettings(camIndex:int): void {
      if (camIndex != -1) {
        for(var i:int = 0; i < _myCamSettings.length; i++) {
          if (_myCamSettings.getItemAt(i) != null && _myCamSettings.getItemAt(i).camIndex == camIndex) {
            _myCamSettings.removeItemAt(i);
            return;
          }
        }
      }
    }
    
    public function myCamSettings():ArrayCollection {
      return _myCamSettings;
    }
    
    public function applyLockSettings():void {
      var lockSettings:LockSettingsVO = UsersUtil.getLockSettings();
      var amNotModerator:Boolean = !UsersUtil.amIModerator();
      var amNotPresenter:Boolean = !UsersUtil.amIPresenter();
      var lockAppliesToMe:Boolean = amNotModerator && amNotPresenter && userLocked;
      
      disableMyCam = lockAppliesToMe && lockSettings.getDisableCam();
      disableMyMic = lockAppliesToMe && lockSettings.getDisableMic();
      disableMyPrivateChat = lockAppliesToMe && lockSettings.getDisablePrivateChat();
      disableMyPublicChat = lockAppliesToMe && lockSettings.getDisablePublicChat();
      lockedLayout = lockAppliesToMe && lockSettings.getLockedLayout();
      
      var dispatcher:Dispatcher = new Dispatcher();
      dispatcher.dispatchEvent(new LockControlEvent(LockControlEvent.CHANGED_LOCK_SETTINGS));
      
      if (lockAppliesToMe) {
        //If it's sharing webcam, stop it
        if (disableMyCam && LiveMeeting.inst().webcams.getStreamsForUser(LiveMeeting.inst().me.id)) {
          dispatcher.dispatchEvent(new ClosePublishWindowEvent());
        }
        //If it's sharing microphone, mute it
        var myVoiceUser: VoiceUser2x = LiveMeeting.inst().voiceUsers.getUser(LiveMeeting.inst().me.id);
        
        if (disableMyMic && (myVoiceUser != null) && ! myVoiceUser.muted) {
          var e:VoiceConfEvent = new VoiceConfEvent(VoiceConfEvent.MUTE_USER);
          e.userid = UsersUtil.getMyUserID();
          e.mute = true;
          dispatcher.dispatchEvent(e);
        }
      }
    }
  }
}


