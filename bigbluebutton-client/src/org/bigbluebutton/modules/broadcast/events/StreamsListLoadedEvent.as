package org.bigbluebutton.modules.broadcast.events
{
  import flash.events.Event;
  
  public class StreamsListLoadedEvent extends Event
  {
    public static const STREAMS_LIST_LOADED:String = "broadcast streams list loaded event";
    
    public function StreamsListLoadedEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}