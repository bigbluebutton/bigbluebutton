package org.bigbluebutton.modules.notes.services
{
  import flash.events.IEventDispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesModel;
  import org.bigbluebutton.modules.notes.models.NotesOptions;

  public class NotesMessageService
  {
    private var _notesModel:NotesModel = new NotesModel();
    
    private var _noteSavers:ArrayCollection = new ArrayCollection();    
    private var _options:NotesOptions;
    private var _dispatcher:IEventDispatcher;
    
    public function NotesMessageService(dispatcher:IEventDispatcher) {
      _options = new NotesOptions();
      _dispatcher = dispatcher;
    }
    
    public function save(note:String):void {
      var date:Date = new Date();

      var n:Note = new Note();
      n.noteID = generateRandomString(5) + date.time;
      n.note = note;
      n.saved = false;
      _notesModel.addNote(n);
      
      var noteSaver:NoteSaver = new NoteSaver(n, _options.saveURL, _dispatcher);
      _noteSavers.addItem(noteSaver);
      
      noteSaver.save();
      
    }
    
    public function saveError(event:SaveErrorEvent):void {
      // TODO: Re-save?
    }
    
    public function saveSuccess(noteID:String):void {
      _notesModel.noteSaved(noteID);
    }
    
    private function generateRandomString(strlen:Number):String{
      var chars:String = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      var num_chars:Number = chars.length - 1;
      var randomChar:String = "";
      
      for (var i:Number = 0; i < strlen; i++){
        randomChar += chars.charAt(Math.floor(Math.random() * num_chars));
      }
      return randomChar;
    }
  }
}