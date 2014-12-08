package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class UploadIoErrorEvent extends Event
  {
    public static const UPLOAD_IO_ERROR:String = "presentation upload io error event";
    
    public function UploadIoErrorEvent()
    {
      super(UPLOAD_IO_ERROR, true, false);
    }
  }
}