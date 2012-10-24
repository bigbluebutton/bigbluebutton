package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class CoreEvent extends Event
  {
    public var message:Object = new Object();
    
    public function CoreEvent(type:String, bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(type, bubbles, cancelable);
    }
  }
}