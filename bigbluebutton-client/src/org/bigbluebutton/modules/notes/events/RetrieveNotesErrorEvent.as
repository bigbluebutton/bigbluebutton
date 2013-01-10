package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class RetrieveNotesErrorEvent extends Event
  {
    public static const RETRIEVE_ERROR:String = "notes retrieve error event";
    
    public function RetrieveNotesErrorEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(RETRIEVE_ERROR, bubbles, cancelable);
    }
  }
}