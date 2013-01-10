package org.bigbluebutton.modules.notes.maps
{
  import com.asfusion.mate.events.Dispatcher;
  
  import flash.events.IEventDispatcher;
  
  import org.bigbluebutton.common.events.OpenWindowEvent;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesEvent;
  import org.bigbluebutton.modules.notes.events.RetrieveNotesSuccessEvent;
  import org.bigbluebutton.modules.notes.events.SaveNoteEvent;
  import org.bigbluebutton.modules.notes.models.NotesModel;
  import org.bigbluebutton.modules.notes.views.NotesWindow;

  public class NotesEventMapDelegate
  {    
    private var _notesWindow:NotesWindow;
    private var _dispatcher:IEventDispatcher;
    
    public var notesModel:NotesModel;
    
    public function NotesEventMapDelegate(dispatcher:IEventDispatcher)
    {
      _dispatcher = dispatcher;
      _dispatcher.dispatchEvent(new RetrieveNotesEvent());
    }
    
    public function handleRetrieveNotesSuccessEvent(event:RetrieveNotesSuccessEvent):void {
      notesModel.notes = event.notes;
      
      openNotesWindow();
      saveALoginNote();    
    }
    
    private function saveALoginNote():void {
      var saveEvent:SaveNoteEvent = new SaveNoteEvent();
      saveEvent.note = "** Logged in. **";
      _dispatcher.dispatchEvent(saveEvent);
    }
    
    public function openNotesWindow():void {
      _notesWindow = new NotesWindow();
      _notesWindow.notesModel = notesModel;
      
      var event:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
      event.window = _notesWindow; 
      _dispatcher.dispatchEvent(event);	
    }
  }
}