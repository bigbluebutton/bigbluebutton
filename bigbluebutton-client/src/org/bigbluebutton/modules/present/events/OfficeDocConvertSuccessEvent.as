package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class OfficeDocConvertSuccessEvent extends Event
  {
    public static const OFFICE_DOC_CONVERT_SUCCESS:String = "presentation office doc convert success event";
    
    public function OfficeDocConvertSuccessEvent()
    {
      super(OFFICE_DOC_CONVERT_SUCCESS, true, false);
    }
  }
}