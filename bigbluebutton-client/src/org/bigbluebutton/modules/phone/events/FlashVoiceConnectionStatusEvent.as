package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class FlashVoiceConnectionStatusEvent extends Event
  {
    public static const CONN_STATUS:String = "flash voice connection status event";
    
    public static const CONNECTED:String = "flash voice connection status connected event";
    public static const DISCONNECTED:String = "flash voice connection status disconnected event";
    public static const FAILED:String = "flash voice connection status failed event";
    public static const NETWORK_CHANGE:String = "flash voice connection status network change event";
    
    public var status:String;
    public var reconnecting:Boolean;
    
    public function FlashVoiceConnectionStatusEvent(connStatus:String, isReconnecting:Boolean = false)
    {
      super(CONN_STATUS, true, false);
      status = connStatus;
      reconnecting = isReconnecting;
    }
  }
}