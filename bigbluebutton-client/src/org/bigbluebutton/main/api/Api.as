package org.bigbluebutton.main.api
{
  import flash.external.ExternalInterface;

  public class Api
  {
    public function Api()
    {
    }
    
    private function init():void {
      ExternalInterface.addCallback("joinVoice", placeHolder);
      ExternalInterface.addCallback("leaveVoice", placeHolder);
      ExternalInterface.addCallback("muteUser", placeHolder);
      ExternalInterface.addCallback("unmuteUser", placeHolder);
      ExternalInterface.addCallback("shareVideo", placeHolder);
      ExternalInterface.addCallback("unshareVideo", placeHolder);
    }
    
    private function placeHolder():void {
      
    }
  }
}