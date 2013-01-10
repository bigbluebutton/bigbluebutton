package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class SaveSuccessEvent extends Event
  {
    public static const NOTE_SAVE_SUCCESS:String = "note save success event";
    
    public var noteID:String;
    public var timestamp:String;
    
    public function SaveSuccessEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(NOTE_SAVE_SUCCESS, bubbles, cancelable);
    }
  }
}