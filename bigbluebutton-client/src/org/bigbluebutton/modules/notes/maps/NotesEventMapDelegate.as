package org.bigbluebutton.modules.notes.maps
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.events.OpenWindowEvent;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesEvent;
  import org.bigbluebutton.modules.notes.views.NotesWindow;

  public class NotesEventMapDelegate
  {
    
    private var _notesWindow:NotesWindow;
    private var _dispatcher:IEventDispatcher;
    
    public function NotesEventMapDelegate(dispatcher:IEventDispatcher)
    {
      _dispatcher = dispatcher;
      openNotesWindow();
    }
    
    public function openNotesWindow():void {
      _notesWindow = new NotesWindow();
      var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
      event.window = _notesWindow; 
      _dispatcher.dispatchEvent(event);	
      
      _dispatcher.dispatchEvent(new RetrieveNotesEvent());
    }
  }
}