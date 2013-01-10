package org.bigbluebutton.modules.videoconf.events
{
  import flash.events.Event;
  
  public class VideoModuleStopEvent extends Event
  {
    public static const STOP:String = "video module stop event";
    
    public function VideoModuleStopEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}