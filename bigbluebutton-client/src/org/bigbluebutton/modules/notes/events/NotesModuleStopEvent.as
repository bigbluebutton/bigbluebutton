package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class NotesModuleStopEvent extends Event
  {
    public static const NOTES_MODULE_STOP:String = "notes module stop event";
    
    public function NotesModuleStopEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(NOTES_MODULE_STOP, bubbles, cancelable);
    }
  }
}