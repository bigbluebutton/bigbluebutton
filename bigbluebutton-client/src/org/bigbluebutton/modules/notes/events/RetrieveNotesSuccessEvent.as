package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  import mx.collections.ArrayCollection;
  
  public class RetrieveNotesSuccessEvent extends Event
  {
    public static const RETRIEVE_SUCCESS:String = "notes retrieve success event";
    
    public var notes:ArrayCollection;
    
    public function RetrieveNotesSuccessEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(RETRIEVE_SUCCESS, bubbles, cancelable);
    }
  }
}