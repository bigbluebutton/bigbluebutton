package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class OfficeDocConvertFailedEvent extends Event
  {
    public static const OFFICE_DOC_CONVERT_FAILED:String = "presentation office doc convert failed event";
    
    public function OfficeDocConvertFailedEvent()
    {
      super(OFFICE_DOC_CONVERT_FAILED, true, false);
    }
  }
}