package org.bigbluebutton.modules.present.events
{
  import flash.events.Event;
  
  public class QueryPresentationsListEvent extends Event
  {
    
    public static const QUERY_PRESENTATIONS_LIST:String = "queryPresentationsListEvent";
    
    public function QueryPresentationsListEvent()
    {
      super(QUERY_PRESENTATIONS_LIST, true, false);
    }
  }
}