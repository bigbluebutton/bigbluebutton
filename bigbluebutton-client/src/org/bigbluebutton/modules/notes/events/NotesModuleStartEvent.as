package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class NotesModuleStartEvent extends Event
  {
    public static const NOTES_MODULE_START:String = "notes module start event";
    
    public function NotesModuleStartEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(NOTES_MODULE_START, bubbles, cancelable);
    }
  }
}