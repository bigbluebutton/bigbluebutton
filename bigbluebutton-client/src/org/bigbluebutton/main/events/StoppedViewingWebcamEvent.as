package org.bigbluebutton.main.events
{
  import flash.events.Event;
  
  public class StoppedViewingWebcamEvent extends Event
  {
    public static const STOPPED_VIEWING_WEBCAM:String = "stopped viewing webcam event";
    
    // The userID of the webcam being viewed.
    public var webcamUserID:String;
    
    public function StoppedViewingWebcamEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(STOPPED_VIEWING_WEBCAM, bubbles, cancelable);
    }
  }
}