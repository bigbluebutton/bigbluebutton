package org.bigbluebutton.modules.videoconf.events
{
  import flash.events.Event;
  
  public class VideoModuleStartEvent extends Event
  {
    public static const START:String = "video module start event";
    
    public function VideoModuleStartEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}