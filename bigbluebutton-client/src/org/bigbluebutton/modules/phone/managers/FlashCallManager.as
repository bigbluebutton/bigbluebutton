package org.bigbluebutton.modules.phone.managers
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  import flash.media.Microphone;
  
  import org.bigbluebutton.modules.phone.PhoneOptions;
  import org.bigbluebutton.modules.phone.events.FlashMicSettingsEvent;

  public class FlashCallManager
  {
    private static const LOG:String = "Phone::FlashCallManager - ";
    
    private var options:PhoneOptions;
    private var echoTestDone:Boolean = false;
    private var doingEchoTest:Boolean = false;
    private var micNames:Array = new Array();
    private var dispatcher:Dispatcher = new Dispatcher();
    
    public function FlashCallManager()
    {
      micNames = Microphone.names;
    }
    
    private function isWebRtcSupported():Boolean {
      return (ExternalInterface.available && ExternalInterface.call("isWebrtcCapable"));
    }

    private function joinIntoVoiceConference():void {
      
    }
    
    private function doEchoTest():void {
      dispatcher.dispatchEvent(new FlashMicSettingsEvent(micNames));
    }
    
    private function startUsingFlash():void {
      if (options.skipCheck || echoTestDone) {
        joinIntoVoiceConference();
      } else {
        doEchoTest();
      }
    }
    
    private function autoJoin():void {
      if (options.autoJoin) {
        startUsingFlash();
      }      
    }
    
    private function skipEchoTest():void {
      
    }
    
    private function printMics():void {
      for (var i:int = 0; i < micNames.length; i++) {
        trace(LOG + "*** MIC [" + i + "] = [" + micNames[i] + "]");
      }
    }
    
    public function initialize():void {      
      printMics();
      options = new PhoneOptions();
      if (options.useWebrtcIfAvailable) {
        if (!isWebRtcSupported()) {
          autoJoin();
        }
      } else {
        autoJoin();
      }
    }
  }
}