package org.bigbluebutton.modules.notes.models
{
  import mx.collections.ArrayCollection;

  public class NotesModel
  {
    [Bindable]
    public var notes:ArrayCollection = new ArrayCollection();
        
    public function addNote(n:Note):void {
      notes.addItem(n);
    }
    
    public function noteSaved(noteID:String, timestamp:String):void {
      for (var i:int = 0; i < notes.length; i++){
        var item:Note = notes.getItemAt(i) as Note;
        if (item.noteID == noteID) {
          item.saved = true;
          item.timestamp = timestamp;
        }
      }
    }
    
    public function getNote(noteID:String):Note {
      for (var i:int = 0; i < notes.length; i++){
        var item:Note = notes.getItemAt(i) as Note;
        if (item.noteID == noteID) {
          return item;
        }
      }  
      
      return null;
    }
  }
}