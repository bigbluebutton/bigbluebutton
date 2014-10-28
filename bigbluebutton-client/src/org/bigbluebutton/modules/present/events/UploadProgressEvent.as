package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class UploadProgressEvent extends Event
  {
    public static const UPLOAD_PROGRESS_UPDATE:String = "presentation upload progress update event";
    
    public var percentUploaded:Number;
    
    public function UploadProgressEvent(percent:Number)
    {
      super(UPLOAD_PROGRESS_UPDATE, true, false);
      percentUploaded = percent;
    }
  }
}