package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class GetListOfPresentationsRequest extends Event
  {
    public static const GET_LIST_OF_PRESENTATIONS:String = "presentation get list of presentations request";

    public var podId:String;

    public function GetListOfPresentationsRequest(_podId: String)
    {
      super(GET_LIST_OF_PRESENTATIONS, true, false);
      this.podId = _podId;
    }
  }
}