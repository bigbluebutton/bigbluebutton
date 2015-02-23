package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.TimerEvent;
  import flash.external.ExternalInterface;
  import flash.utils.Timer;
  
  import flexlib.scheduling.timelineClasses.TimeRangeDescriptorUtil;
  
  import mx.controls.Alert;
  import mx.events.CloseEvent;
  
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.api.JSAPI;
  import org.bigbluebutton.main.events.ClientStatusEvent;
  import org.bigbluebutton.modules.phone.PhoneModel;
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.FlashCallDisconnectedEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.PerformEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.UseFlashModeCommand;
  import org.bigbluebutton.modules.phone.events.WebRTCAskUserToChangeMicEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCJoinedVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCMediaEvent;
  import org.bigbluebutton.modules.phone.models.Constants;
  import org.bigbluebutton.modules.phone.models.WebRTCModel;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class WebRTCCallManager
  {
    private static const LOG:String = "Phone::WebRTCCallManager - ";
    
    private var browserType:String = "unknown";
    private var browserVersion:int = 0;
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    private var usingWebRTC:Boolean = false;
    private var options:PhoneOptions;
    
    private var model:WebRTCModel = PhoneModel.getInstance().webRTCModel;
    
    public function WebRTCCallManager() {
      var browserInfo:Array = JSAPI.getInstance().getBrowserInfo();
      if (browserInfo != null) {
        browserType = browserInfo[0];
        browserVersion = browserInfo[1];
      }
      options = new PhoneOptions();
      
      // only show the warning if the admin has enabled WebRTC
      if (options.useWebRTCIfAvailable && !isWebRTCSupported()) {
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.WARNING_MESSAGE_EVENT, 
          ResourceUtil.getInstance().getString("bbb.clientstatus.webrtc.title"), 
          ResourceUtil.getInstance().getString("bbb.clientstatus.webrtc.message")));
      }
      
      usingWebRTC = checkIfToUseWebRTC();
    }
    
    private function isWebRTCSupported():Boolean {
      trace(LOG + "- isWebRTCSupported - ExternalInterface.available=[" + ExternalInterface.available 
        + "], isWebRTCAvailable=[" + ExternalInterface.call("isWebRTCAvailable") + "]");
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRTC) hangup();
    }
    
    public function initialize():void {         

    }
    
    
    private function checkIfToUseWebRTC():Boolean {
      var webRTCSupported:Boolean = isWebRTCSupported();
      
      trace(LOG + "- checkIfToUseWebRTC - useWebRTCIfAvailable=[" + options.useWebRTCIfAvailable 
        + "], isWebRTCSupported=[" + webRTCSupported + "]");
      if (options.useWebRTCIfAvailable && webRTCSupported) {
        return true;
      }      
      return false;
    }
    
    private function startWebRTCEchoTest():void {
      model.state = Constants.CALLING_INTO_ECHO_TEST;
      ExternalInterface.call("startWebRTCAudioTest");
    }
    
    private function endEchoTest():void {
      ExternalInterface.call("stopWebRTCAudioTest");
    }
    
    private function endEchoTestJoinConference():void {
      ExternalInterface.call("stopWebRTCAudioTestJoinConference");
    }
    
    private function hangup():void {
      ExternalInterface.call("stopWebRTCAudioTest");
    }
    
    public function handleWebRTCEchoTestStartedEvent():void {
      model.state = Constants.DO_ECHO_TEST;
      dispatcher.dispatchEvent(new WebRTCEchoTestStartedEvent());
    }
    
    public function handleWebRTCEchoTestNoAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestNoAudioEvent");
      model.state = Constants.ECHO_TEST_FAILED;
      endEchoTest();
      
      dispatcher.dispatchEvent(new UseFlashModeCommand());
    }
    
    private var t:Timer;
    
    public function handleWebRTCEchoTestHasAudioEvent():void {
      trace(LOG + "handleWebRTCEchoTestHasAudioEvent");
      model.state = Constants.STOP_ECHO_THEN_JOIN_CONF;
      endEchoTestJoinConference();
    }
    
    public function handleWebRTCCallStartedEvent():void {
      trace(LOG + "setting state to IN_CONFERENCE");
      model.state = Constants.IN_CONFERENCE;
      dispatcher.dispatchEvent(new WebRTCJoinedVoiceConferenceEvent());
      
    }
    
    public function handleWebRTCCallEndedEvent():void {
      model.state = Constants.INITED;
      
      
    }
    
    private function joinVoiceConference():void {
      model.state = Constants.JOIN_VOICE_CONFERENCE;
      ExternalInterface.call("joinWebRTCVoiceConference");      
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      trace(LOG + "handleJoinVoiceConferenceCommand - usingWebRTC: " + usingWebRTC + ", event.mic: " + event.mic);
      
      if (!usingWebRTC || !event.mic) return;
      
      if (options.skipCheck || echoTestDone) {
        joinVoiceConference();
      } else {
        startWebRTCEchoTest();
      }
    }
    
    public function handleLeaveVoiceConferenceCommand():void {
      if (!usingWebRTC) return;
      model.state = Constants.INITED;
      ExternalInterface.call("leaveWebRTCVoiceConference");
    }
    
	  public function handleBecomeViewer():void {
		  trace(LOG + "handleBecomeViewer received");
		  if (options.presenterShareOnly) {
			  if (!usingWebRTC || model.state != Constants.IN_CONFERENCE || UsersUtil.amIModerator()) return;
			
			  trace(LOG + "handleBecomeViewer leaving WebRTC and joining listen only stream");
			  ExternalInterface.call("leaveWebRTCVoiceConference");
			
			  var command:JoinVoiceConferenceCommand = new JoinVoiceConferenceCommand();
			  command.mic = false;
			  dispatcher.dispatchEvent(command);
		  }
	  }
	
    public function handleUseFlashModeCommand():void {
      usingWebRTC = false;
    }

    public function handleWebRTCEchoTestFailedEvent(event:WebRTCEchoTestEvent):void {
      var errorString:String;
      model.state = Constants.INITED;
      endEchoTest();

      if (event.errorCode == 1004) {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode, [event.cause]);
      } else {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode);
      }
      
      if (!errorString) {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.unknown", [event.errorCode]);
      }
      
      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), errorString);
    }
    
    public function handleWebRTCEchoTestEndedUnexpectedly():void {
      model.state = Constants.INITED;
      var errorString:String = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.endedunexpectedly");
      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), errorString);
    }
    
    public function handleWebRTCCallFailedEvent(event:WebRTCEchoTestEvent):void {
      var errorString:String;
      model.state = Constants.INITED;
      
      if (event.errorCode == 1004) {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode, [event.cause]);
      } else {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode);
      }
      
      if (!errorString) {
        errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.unknown", [event.errorCode]);
      }
      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), errorString);
    }
    
    public function handleWebRTCMediaFailedEvent():void {
      model.state = Constants.INITED;
      var errorString:String = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.mediamissing");
      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"), ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]), errorString);
    }
    
    private var popUpDelayTimer:Timer = new Timer(100, 1);
    
    private function handleCallFailedUserResponse(e:CloseEvent):void {
      if (e.detail == Alert.YES){
        /**
         * There is a bug in Flex SDK 4.14 where the screen stays blurry if a 
         * pop-up is opened from another pop-up. I delayed the second open to 
         * avoid this case. - Chad
         */
        popUpDelayTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
          dispatcher.dispatchEvent(new UseFlashModeCommand());
        });
        popUpDelayTimer.start();
      } else {
        dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.CLOSED_AUDIO_SELECTION));
      }
    }
    
    private function sendWebRTCAlert(title:String, message:String, error:String):void {
      /**
       * There is a bug in Flex SDK 4.14 where the screen stays blurry if a 
       * pop-up is opened from another pop-up. I delayed the second open to 
       * avoid this case. - Chad
       */
      popUpDelayTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        Alert.show(message, title, Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
      });
      popUpDelayTimer.start();
      dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, title, error));
    }
  }
}