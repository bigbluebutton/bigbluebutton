package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;  
  import flash.external.ExternalInterface;  
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskMicPermissionToJoinConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcCallConnectedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRtcRemoveAskMicPermissionEvent;

  public class WebRtcCallManager
  {
    private static const LOG:String = "Phone::WebRtcCallManager - ";
    
    private var browserType:String = "unknown";
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    private var usingWebRtc:Boolean = false;
    private var options:PhoneOptions;
    
    public function WebRtcCallManager() {
      browserType = JSAPI.getInstance().getBrowserType();
    }
    
    private function isWebRtcSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebrtcCapable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRtc) hangup();
    }
    
    public function initialize():void {         
      options = new PhoneOptions();
      if (options.useWebrtcIfAvailable && isWebRtcSupported()) {
        usingWebRtc = true;
        startWebRtcEchoTest();
        askMicPermission();        
      }
    }
    
    private function startWebRtcEchoTest():void {
      ExternalInterface.call("startWebrtcAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    private function hangup():void {
      ExternalInterface.call("stopWebrtcAudioTest");
    }
    
    private function askMicPermission():void {      
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionEvent(browserType));       
    }
    
    private function hideMicPermission():void {
      dispatcher.dispatchEvent(new WebRtcRemoveAskMicPermissionEvent());
    }
    
    public function handleWebRtcEchoTestStarted():void {     
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcEchoTestStartedEvent());
    }
    
    public function handleWebRtcEchoTestNoAudioEvent():void {
      endEchoTest();
      hideMicPermission();
      if (browserType == "Firefox") {
        startWebRtcEchoTest();
      }
      
      dispatcher.dispatchEvent(new WebRtcAskUserToChangeMicEvent(browserType));
    }
    
    public function handleWebRtcEchoTestHasAudioEvent():void {
      endEchoTest();
      /**
       * Force echo test even if user has done echo test. This way, user is able to change mics
       * after. (richard mar 28, 2014)
       */
      //echoTestDone = true;
      joinVoiceConference();
    }
    
    public function handleWebRtcConfCallStartedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcCallConnectedEvent());
    }
    
    public function handleWebRtcConfCallEndedEvent():void {
      hideMicPermission();
      dispatcher.dispatchEvent(new WebRtcCallDisconnectedEvent());
    }
    
    private function joinVoiceConference():void {
      ExternalInterface.call("joinWebRtcVoiceConference");
      dispatcher.dispatchEvent(new WebRtcAskMicPermissionToJoinConferenceEvent(browserType));        
    }
    
    public function handleJoinVoiceConferenceCommand():void {
      if (!usingWebRtc) return;
      
      if (echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRtcEchoTest();
      }     
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      if (!usingWebRtc) return;
      
      ExternalInterface.call("leaveWebRtcVoiceConference");
    }
    
    public function handleUseFlashModeCommand():void {
      usingWebRtc = false;
      hangup();
    }

    public function handleWebrtcEchoTestFailedEvent(reason:String):void {
      endEchoTest();
      hideMicPermission();
    }
  }
}