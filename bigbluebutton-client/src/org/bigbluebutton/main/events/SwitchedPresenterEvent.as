package org.bigbluebutton.main.events
{
  import flash.events.Event;
  
  public class SwitchedPresenterEvent extends Event
  {
    public static const SWITCHED_PRESENTER:String = "switched presenter event";
    
    public var amIPresenter:Boolean;
    public var newPresenterUserID:String;
    
    public function SwitchedPresenterEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(SWITCHED_PRESENTER, bubbles, cancelable);
    }
  }
}