package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.common.LogUtil;

  public class ExternalApiCalls
  {   
    public function handleUserJoinedVoiceEvent():void {
      LogUtil.debug("User has joined voice conference.");
      var payload:Object = new Object();
      payload.eventName = "userHasJoinedVoiceConference";
      broadcastEvent(payload);
    }
    
    public function handleSwitchedLayoutEvent(layoutID:String):void {
      var payload:Object = new Object();
      payload.eventName = "switchedLayoutEvent";
      payload.layoutID = layoutID;
      broadcastEvent(payload);
    }
    
    private function broadcastEvent(message:Object):void {
      if (ExternalInterface.available) {
        ExternalInterface.call("BBB.handleFlashClientBroadcastEvent", message);
      }      
    }
  }
}