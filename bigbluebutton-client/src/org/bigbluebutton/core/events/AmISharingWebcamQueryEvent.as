package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class AmISharingWebcamQueryEvent extends Event
  {
    public static const AM_I_SHARING_CAM_QUERY:String = "am I sharing cam query event";
    
    public function AmISharingWebcamQueryEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(AM_I_SHARING_CAM_QUERY, bubbles, cancelable);
    }
  }
}