package org.bigbluebutton.core.model
{
  
  public class SharedNotes
  {
    
    public var numAdditionalSharedNotes:Number = 0;
    
    private var _numActiveSharedNotes:Number = 1;
    
    public function SharedNotes()
    {
    }
    
    public function addNewSharedNote(): void {
      _numActiveSharedNotes++;
    }
    
    public function removeSharedNote(): void {
      _numActiveSharedNotes--
    }
    
    public function get numActiveSharedNotes(): Number {
      return _numActiveSharedNotes;
    }
  }
}