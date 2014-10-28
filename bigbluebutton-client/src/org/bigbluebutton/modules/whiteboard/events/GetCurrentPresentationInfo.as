package org.bigbluebutton.modules.whiteboard.events
{
  import flash.events.Event;
  
  public class GetCurrentPresentationInfo extends Event
  {
    public static const GET_CURRENT_PRESENTATION_INFO:String = "Get Current Presentation Info Event";
    
    public function GetCurrentPresentationInfo()
    {
      super(GET_CURRENT_PRESENTATION_INFO, true, false);
    }
  }
}