package org.bigbluebutton.core.model
{
  import mx.collections.ArrayCollection;
  import mx.collections.Sort;
  import mx.collections.SortField;

  public class SharedNotes
  {
    [Bindable]
    public var numAdditionalSharedNotes:Number = 0;
    [Bindable]
    public var mainNoteVisible:Boolean = false;
    [Bindable]
    public var isMaxNumOfNotes:Boolean = true;

    private var activeNotesIds:ArrayCollection = new ArrayCollection();
    
    public function SharedNotes() {
      var sortField:SortField = new SortField();
      sortField.name = "id";
      sortField.numeric = true;
      var sort:Sort = new Sort();
      sort.fields = [sortField];
      activeNotesIds.sort = sort;
    }
    
    public function addNewSharedNote(noteId:Number): void {
      activeNotesIds.addItem({id:noteId});
      activeNotesIds.refresh();
    }
    
    public function removeSharedNote(noteId:Number): void {
      for (var x:int = 0; x < activeNotesIds.length; ++x) {
        var obj:Object = activeNotesIds.getItemAt(x);
        if (obj.id == noteId) {
          activeNotesIds.removeItemAt(x);
          break;
        }
      }
    }

    public function updateNotesIds(notes:Object): void {
      activeNotesIds.removeAll();
      for(var id:String in notes){
        // Avoid the main shared note
        if (id != "MAIN_NOTE") {
          addNewSharedNote(Number(id));
        }
      }
      activeNotesIds.refresh();
    }

    public function nextNoteId(): Number {
      var noteCounter:Number = 1;
      for (var x:int = 0; x < activeNotesIds.length; ++x) {
        var obj:Object = activeNotesIds.getItemAt(x);
        if (obj.id != noteCounter) break;
        noteCounter++;
      }
      return noteCounter;
    }
  }
}