package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class GetListOfPresentationsRequest extends Event
  {
    public static const GET_LIST_OF_PRESENTATIONS:String = "presentation get list of presentations request";
    
    public function GetListOfPresentationsRequest()
    {
      super(GET_LIST_OF_PRESENTATIONS, true, false);
    }
  }
}