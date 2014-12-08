package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class UploadSecurityErrorEvent extends Event
  {
    public static const UPLOAD_SECURITY_ERROR:String = "presentation upload security error event";
    
    public function UploadSecurityErrorEvent()
    {
      super(UPLOAD_SECURITY_ERROR, true, false);
    }
  }
}