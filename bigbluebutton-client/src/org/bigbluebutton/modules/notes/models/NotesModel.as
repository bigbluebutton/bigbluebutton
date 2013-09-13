/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 *
 */
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