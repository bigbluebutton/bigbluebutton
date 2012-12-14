package org.bigbluebutton.core.events
{
  import flash.events.Event;
  
  public class AmIPresenterQueryEvent extends Event
  {
    public static const AM_I_PRESENTER_QUERY:String = "am I presenter query request";
    
    public function AmIPresenterQueryEvent(bubbles:Boolean=true, cancelable:Boolean=false) {
      super(AM_I_PRESENTER_QUERY, bubbles, cancelable);
    }
  }
}