package org.bigbluebutton.modules.notes.models
{
  import mx.collections.ArrayCollection;

  public class NotesModel
  {
    private var _notes:ArrayCollection = new ArrayCollection();
        
    public function addNote(n:Note):void {
      _notes.addItem(n);
    }
    
    public function noteSaved(noteID:String):void {
      for (var i:int = 0; i < _notes.length; i++){
        var item:Note = _notes.getItemAt(i) as Note;
        if (item.noteID == noteID) {
          item.saved = true;
        }
      }
    }
    
    public function getNote(noteID:String):Note {
      for (var i:int = 0; i < _notes.length; i++){
        var item:Note = _notes.getItemAt(i) as Note;
        if (item.noteID == noteID) {
          return item;
        }
      }  
      
      return null;
    }
  }
}