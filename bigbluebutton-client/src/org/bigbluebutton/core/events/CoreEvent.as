package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class CoreEvent extends Event
  {
    public var message:Object;
    
    public function CoreEvent(type:String, bubbles:Boolean=false, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}