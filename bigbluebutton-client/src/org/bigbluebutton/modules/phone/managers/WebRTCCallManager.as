package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.TimerEvent;
  import flash.external.ExternalInterface;
  import flash.utils.Timer;
  
  import mx.controls.Alert;
  import mx.events.CloseEvent;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.as3commons.logging.util.jsonXify;
  import org.bigbluebutton.core.Options;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.main.events.ClientStatusEvent;
  import org.bigbluebutton.main.model.users.AutoReconnect;
  import org.bigbluebutton.modules.phone.events.AudioSelectionWindowEvent;
  import org.bigbluebutton.modules.phone.events.JoinVoiceConferenceCommand;
  import org.bigbluebutton.modules.phone.events.UseFlashModeCommand;
  import org.bigbluebutton.modules.phone.events.WebRTCCallEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCEchoTestStartedEvent;
  import org.bigbluebutton.modules.phone.events.WebRTCJoinedVoiceConferenceEvent;
  import org.bigbluebutton.modules.phone.models.Constants;
  import org.bigbluebutton.modules.phone.models.PhoneModel;
  import org.bigbluebutton.modules.phone.models.PhoneOptions;
  import org.bigbluebutton.modules.phone.models.WebRTCAudioStatus;
  import org.bigbluebutton.modules.phone.models.WebRTCModel;
  import org.bigbluebutton.util.i18n.ResourceUtil;

  public class WebRTCCallManager
  {
    private static const LOGGER:ILogger = getClassLogger(WebRTCCallManager);
    private const MAX_RETRIES:Number = 3;
    
    private var dispatcher:Dispatcher = new Dispatcher();
    private var echoTestDone:Boolean = false;
    
    private var usingWebRTC:Boolean = false;
    private var options:PhoneOptions;
    
    private var model:WebRTCModel = PhoneModel.getInstance().webRTCModel;

    private var reconnect:AutoReconnect = new AutoReconnect();
    private var reconnecting:Boolean = false;
    
    public function WebRTCCallManager() {
      options = Options.getOptions(PhoneOptions) as PhoneOptions;
      
      // only show the warning if the admin has enabled WebRTC
      if (options.useWebRTCIfAvailable && !isWebRTCSupported()) {
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.WARNING_MESSAGE_EVENT, 
          ResourceUtil.getInstance().getString("bbb.clientstatus.webrtc.title"), 
          ResourceUtil.getInstance().getString("bbb.clientstatus.webrtc.message"),
          'bbb.clientstatus.webrtc.title'));
      }
    }
    
    private function isWebRTCSupported():Boolean {
      LOGGER.debug("isWebRTCSupported - ExternalInterface.available=[{0}], isWebRTCAvailable=[{1}]", [ExternalInterface.available, ExternalInterface.call("isWebRTCAvailable")]);
      return (ExternalInterface.available && ExternalInterface.call("isWebRTCAvailable"));
    }
    
    public function userRequestedHangup():void {
      if (usingWebRTC) hangup();
    }
    
    public function initialize():void {         

    }
    
    
    private function checkIfToUseWebRTC():Boolean {
      var webRTCSupported:Boolean = isWebRTCSupported();
      
	  LOGGER.debug("checkIfToUseWebRTC - useWebRTCIfAvailable=[{0}], isWebRTCSupported=[{1}]", [options.useWebRTCIfAvailable, webRTCSupported]);
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
	  LOGGER.debug("handleWebRTCEchoTestNoAudioEvent");
      model.state = Constants.ECHO_TEST_FAILED;
      endEchoTest();
      
      dispatcher.dispatchEvent(new UseFlashModeCommand());
    }
    
    private var t:Timer;
    
    public function handleWebRTCEchoTestHasAudioEvent():void {
      LOGGER.debug("handleWebRTCEchoTestHasAudioEvent");
      model.state = Constants.STOP_ECHO_THEN_JOIN_CONF;
      endEchoTestJoinConference();
    }
    
    public function handleWebRTCCallStartedEvent():void {
	  LOGGER.debug("setting state to IN_CONFERENCE");
      model.state = Constants.IN_CONFERENCE;
      dispatcher.dispatchEvent(new WebRTCJoinedVoiceConferenceEvent());
      if(reconnecting) {
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.SUCCESS_MESSAGE_EVENT,
          ResourceUtil.getInstance().getString("bbb.webrtcWarning.connection.reestablished"),
          ResourceUtil.getInstance().getString("bbb.webrtcWarning.connection.reestablished"),
          'bbb.webrtcWarning.connection.reestablished'));
        reconnecting = false;
      }
    }
    
    public function handleWebRTCCallEndedEvent():void {
      model.state = Constants.INITED;
    }
    
    private function joinVoiceConference():void {
      model.state = Constants.JOIN_VOICE_CONFERENCE;
      ExternalInterface.call("joinWebRTCVoiceConference");      
    }
    
    public function handleJoinVoiceConferenceCommand(event:JoinVoiceConferenceCommand):void {
      var logData:Object = UsersUtil.initLogData();
      logData.usingWebRTC = usingWebRTC;
      logData.eventMic = event.mic;
      logData.message = "handleJoinVoiceConferenceCommand - usingWebRTC:";
      LOGGER.info(JSON.stringify(logData));

      usingWebRTC = checkIfToUseWebRTC();

      if (!usingWebRTC || !event.mic) return;
      
      if ((options.skipCheck && PhoneOptions.firstAudioJoin) || echoTestDone) {
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
    
    public function handleUseFlashModeCommand():void {
      usingWebRTC = false;
      WebRTCAudioStatus.getInstance().setAudioFailState(true);
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
      
        var logData:Object = UsersUtil.initLogData();
      logData.user.reason = errorString;
      logData.tags = ["voice", "webrtc"];
      logData.message = "WebRtc Echo test failed.";
      logData.errorEvent = {code: event.errorCode, cause: event.cause};
      LOGGER.info(jsonXify(logData));

      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"),
              ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]),
              errorString,
              'bbb.webrtcWarning webRTCEchoTestFailedEvent');
    }
    
    public function handleWebRTCEchoTestEndedUnexpectedly():void {
      model.state = Constants.INITED;
      var logCode:String = "bbb.webrtcWarning.failedError.endedunexpectedly";
      var errorString:String = ResourceUtil.getInstance().getString(logCode);

      var logData:Object = UsersUtil.initLogData();
      logData.user.reason = errorString;
      logData.tags = ["voice", "webrtc"];
      logData.message = "WebRtc Echo test ended unexpectedly.";
      LOGGER.info(jsonXify(logData));

      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"),
              ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]),
              errorString,
              logCode);
    }
    
    public function handleWebRTCCallFailedEvent(event:WebRTCCallEvent):void {
      var errorString:String;
      model.state = Constants.INITED;
      
      if(!reconnecting) {
        LOGGER.debug("WebRTC call failed, attempting reconnection");
        reconnecting = true;
        dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.WARNING_MESSAGE_EVENT,
          ResourceUtil.getInstance().getString("bbb.webrtcWarning.connection.dropped"),
          ResourceUtil.getInstance().getString("bbb.webrtcWarning.connection.reconnecting"),
          'bbb.webrtcWarning.connection.dropped,reconnecting'));
        reconnect.onDisconnect(joinVoiceConference, []);
      }
      else {
        LOGGER.debug("WebRTC call reconnection failed");
        if( reconnect.attempts < MAX_RETRIES ) {
          LOGGER.debug("Retrying, attempt " + reconnect.attempts);
          reconnect.onConnectionAttemptFailed();
        }
        else {
          LOGGER.debug("Giving up");
          reconnecting = false;

          if (event.errorCode == 1004) {
            errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode, [event.cause]);
          } else {
            errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError." + event.errorCode);
          }
          
          if (!errorString) {
            errorString = ResourceUtil.getInstance().getString("bbb.webrtcWarning.failedError.unknown", [event.errorCode]);
          }
          
          var logData:Object = UsersUtil.initLogData();
          logData.tags = ["voice", "webrtc"];
          logData.errorEvent = {code: event.errorCode, cause: event.cause};
          LOGGER.info(jsonXify(logData));
          
          sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"),
                  ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]),
                  errorString,
                  'bbb.webrtcWarning.failedError');
        }
      }
    }
    
    public function handleWebRTCMediaFailedEvent():void {
      model.state = Constants.INITED;
      var logCode:String = "bbb.webrtcWarning.failedError.mediamissing";
      var errorString:String = ResourceUtil.getInstance().getString(logCode);

      var logData:Object = UsersUtil.initLogData();
      logData.user.reason = errorString;
      LOGGER.info(jsonXify(logData));

      sendWebRTCAlert(ResourceUtil.getInstance().getString("bbb.webrtcWarning.title"),
              ResourceUtil.getInstance().getString("bbb.webrtcWarning.message", [errorString]),
              errorString,
              logCode);
    }
    
    private var popUpDelayTimer:Timer = new Timer(100, 1);
    
    private function handleCallFailedUserResponse(e:CloseEvent):void {
      if (e.detail == Alert.YES){
        /**
         * There is a bug in Flex SDK 4.14 where the screen stays blurry if a 
         * pop-up is opened from another pop-up. I delayed the second open to 
         * avoid this case. - Chad
         */
        popUpDelayTimer = new Timer(100, 1);
        popUpDelayTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
          dispatcher.dispatchEvent(new UseFlashModeCommand());
        });
        popUpDelayTimer.start();
      } else {
        dispatcher.dispatchEvent(new AudioSelectionWindowEvent(AudioSelectionWindowEvent.CLOSED_AUDIO_SELECTION));
      }
    }
    
    private function sendWebRTCAlert(title:String, message:String, error:String, logCode:String):void {
      /**
       * There is a bug in Flex SDK 4.14 where the screen stays blurry if a 
       * pop-up is opened from another pop-up. I delayed the second open to 
       * avoid this case. - Chad
       */
      popUpDelayTimer = new Timer(100, 1);
      popUpDelayTimer.addEventListener(TimerEvent.TIMER, function(e:TimerEvent):void {
        Alert.show(message, title, Alert.YES | Alert.NO, null, handleCallFailedUserResponse, null, Alert.YES);
      });
      popUpDelayTimer.start();
      dispatcher.dispatchEvent(new ClientStatusEvent(ClientStatusEvent.FAIL_MESSAGE_EVENT, title, error, logCode));

      var logData:Object = UsersUtil.initLogData();
      logData.type = "WebRTCAlert";
      logData.title = title;
      logData.error = error;
      logData.message = message;
      logData.logCode = logCode;
      LOGGER.warn(JSON.stringify(logData));
    }
  }
}
