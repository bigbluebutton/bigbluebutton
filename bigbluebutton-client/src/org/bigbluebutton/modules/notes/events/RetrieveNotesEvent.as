package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class RetrieveNotesEvent extends Event
  {
    public static const RETRIEVE:String = "notes retrieve request event";
    
    public function RetrieveNotesEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(RETRIEVE, bubbles, cancelable);
    }
  }
}