package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  import mx.collections.ArrayCollection;
  
  public class QueryListOfPresentationsReplyEvent extends Event
  {
    public static const QUERY_LIST_OF_PRESENTATIONS_REPLY:String = "query list of presentations reply";
    
    public var presentations:Array;
    
    public function QueryListOfPresentationsReplyEvent()
    {
      super(QUERY_LIST_OF_PRESENTATIONS_REPLY, true, false);
    }
  }
}