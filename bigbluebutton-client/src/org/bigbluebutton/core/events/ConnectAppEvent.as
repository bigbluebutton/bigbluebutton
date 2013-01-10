package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class ConnectAppEvent extends Event
  {
    public static const CONNECT_VIDEO_APP:String = "connect to video app event";
    
    public function ConnectAppEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}