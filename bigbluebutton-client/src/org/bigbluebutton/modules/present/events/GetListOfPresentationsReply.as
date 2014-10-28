package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class GetListOfPresentationsReply extends Event
  {
    public static const GET_LIST_OF_PRESENTATIONS_REPLY:String = "presentation get list of presentations reply event";
    
    // List of presentation (id, name) pair.
    public var presentations:Array;
    
    public function GetListOfPresentationsReply(pres:Array)
    {
      super(GET_LIST_OF_PRESENTATIONS_REPLY, true, false);
      presentations = pres;
    }
  }
}