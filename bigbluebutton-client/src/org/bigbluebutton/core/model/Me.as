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

  public class Me
  {
    public var id:String = "";
    public var name:String = "";
    public var externalId:String = "";
    public var authToken:String = "";
    public var layout:String = "";
    public var logoutURL:String = "";
    
    public var welcome:String = "";
    public var avatarURL:String = "";
    public var dialNumber:String = "";
    
    public var guest:Boolean = true;
    public var authed:Boolean = false;
    public var customData:Object = new Object();
    
    // Flag to tell that user is in the process of leaving the meeting.
    public var isLeavingFlag:Boolean = false;
    
    public var disableMyCam:Boolean = false;
    public var disableMyMic:Boolean = false;
    public var disableMyPrivateChat:Boolean = false;
    public var disableMyPublicChat:Boolean = false;
    public var disableMyNote:Boolean = false;
    public var lockedLayout:Boolean = false;
    
    public var iAskedToLogout:Boolean;
    private var _ejectedFromMeeting:Boolean = false;
    private var _reasonCode: String = "";

    public var locked: Boolean = false;
    public var inVoiceConf: Boolean = false;
    public var muted: Boolean = false;
    
    public var isPresenter: Boolean = false;
    public var emoji: String = "none";
    
    public var authTokenValid: Boolean = false;
    public var waitingForApproval: Boolean;
    
	public var breakoutEjectFromAudio : Boolean = false;
	
    private var _role:String =  "viewer";   
    public function get role():String {
      return _role.toUpperCase();
    }
    
    public function set role(value: String):void {
      _role = value;
    }
    
    public function ejectedFromMeeting(reasonCode: String): void {
      _ejectedFromMeeting = true;
      _reasonCode = reasonCode;
    }
   
    public function hasBeenEjected(): Boolean {
      return _ejectedFromMeeting;
    }

    public function getEjectReasonCode(): String {
      return _reasonCode;
    }

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
      var lockAppliesToMe:Boolean = amNotModerator && amNotPresenter && locked;
      
      disableMyCam = lockAppliesToMe && lockSettings.getDisableCam();
      disableMyMic = lockAppliesToMe && lockSettings.getDisableMic();
      disableMyPrivateChat = lockAppliesToMe && lockSettings.getDisablePrivateChat();
      disableMyPublicChat = lockAppliesToMe && lockSettings.getDisablePublicChat();
      disableMyNote = lockAppliesToMe && lockSettings.getDisableNote();
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