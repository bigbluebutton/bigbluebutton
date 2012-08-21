package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;

  public class OutboundApi
  {
    public function OutboundApi()
    {
    }
    
    public function userJoined(user:Object):void {
      ExternalInterface.call("newUserJoined", user);
    }
  }
}