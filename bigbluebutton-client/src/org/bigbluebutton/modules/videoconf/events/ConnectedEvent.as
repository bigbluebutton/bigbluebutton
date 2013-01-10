package org.bigbluebutton.modules.videoconf.events
{
  import flash.events.Event;
  
  public class ConnectedEvent extends Event
  {
    public static const VIDEO_CONNECTED:String = "connected to video app event";
    
    public function ConnectedEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}