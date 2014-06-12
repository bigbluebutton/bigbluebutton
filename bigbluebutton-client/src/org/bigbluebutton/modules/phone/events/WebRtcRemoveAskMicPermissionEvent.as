package org.bigbluebutton.modules.phone.events
{
  import flash.events.Event;
  
  public class WebRtcRemoveAskMicPermissionEvent extends Event
  {
    public static const REMOVE_MIC_PERMISSION:String = "remove mic permission event";
    
    public function WebRtcRemoveAskMicPermissionEvent()
    {
      super(REMOVE_MIC_PERMISSION, true, false);
    }
  }
}