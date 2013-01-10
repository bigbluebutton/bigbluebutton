package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class SaveNoteEvent extends Event
  {
    public static const SAVE_NOTE:String = "notes module save note event";
    
    public var note:String;
    
    public function SaveNoteEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(SAVE_NOTE, bubbles, cancelable);
    }
  }
}