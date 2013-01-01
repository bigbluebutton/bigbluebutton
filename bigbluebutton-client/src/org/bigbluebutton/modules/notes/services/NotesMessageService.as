package org.bigbluebutton.modules.notes.services
{
  import com.asfusion.mate.events.Dispatcher;
  import mx.collections.ArrayCollection;  
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesOptions;

  public class NotesMessageService
  {
    private var _noteSaver:ArrayCollection = new ArrayCollection();    
    private var _options:NotesOptions;
    private var _dispatcher:Dispatcher;
    
    public function NotesMessageService() {
      _dispatcher = new Dispatcher();
    }
    
    public function save(note:Note):void {
      var noteSaver:NoteSaver = new NoteSaver(note, _dispatcher);
      _noteSaver.addItem(noteSaver);
    }
    
    public function 
  }
}