package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;
  
  import org.bigbluebutton.common.LogUtil;

  public class OutboundApi
  {
    public function OutboundApi()
    {
    }
    
    public function userJoined():void {
      LogUtil.debug("User has joined voice conference.");
      ExternalInterface.call("userHasJoinedVoiceConference");
    }
  }
}