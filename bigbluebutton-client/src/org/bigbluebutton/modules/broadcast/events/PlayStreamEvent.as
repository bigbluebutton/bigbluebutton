package org.bigbluebutton.modules.broadcast.events
{
  import flash.events.Event;
  
  public class PlayStreamEvent extends Event
  {
    public function PlayStreamEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}