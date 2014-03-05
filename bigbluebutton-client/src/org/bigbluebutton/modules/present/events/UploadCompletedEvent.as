package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class UploadCompletedEvent extends Event
  {
    public static const UPLOAD_COMPLETED:String = "presentation upload completed event";
    
    public function UploadCompletedEvent()
    {
      super(UPLOAD_COMPLETED, true, false);
    }
  }
}