package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class SaveErrorEvent extends Event
  {
    public static const NOTE_SAVE_ERROR:String = "note save error event";
    
    public static const SUCCESS:String = "note save success event";
    public static const FAILED_TO_SAVE:String = "note failed to save event";
    public static const SECURITY_ERROR:String = "note security error event";
    public static const IO_ERROR:String       = "note io error event";
    
    public var reason:String;
    public var noteID:String;
    
    public function SaveErrorEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(NOTE_SAVE_ERROR, bubbles, cancelable);
    }
  }
}