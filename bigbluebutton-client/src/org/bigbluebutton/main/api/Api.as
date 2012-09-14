package org.bigbluebutton.main.api
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.external.ExternalInterface;
  
  import mx.controls.Alert;
  
  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.main.events.BBBEvent;

  public class Api
  {
    public function Api()
    {
      init();
    }
    
    private function init():void {
      LogUtil.debug("******************** INITING CALLBACKS ******************************");
      ExternalInterface.addCallback("joinVoice", joinVoiceConference);
      ExternalInterface.addCallback("leaveVoice", placeHolder);
      ExternalInterface.addCallback("muteUser", placeHolder);
      ExternalInterface.addCallback("unmuteUser", placeHolder);
      ExternalInterface.addCallback("shareVideo", placeHolder);
      ExternalInterface.addCallback("unshareVideo", placeHolder);
    }
    
    private function placeHolder():void {
      LogUtil.debug("Placeholder");
    }
    
    private function joinVoiceConference():void {
      LogUtil.debug("Joining voice conference");
      var globalDispatcher:Dispatcher = new Dispatcher();
      globalDispatcher.dispatchEvent(new BBBEvent(BBBEvent.JOIN_VOICE_CONFERENCE));
    }
  }
}