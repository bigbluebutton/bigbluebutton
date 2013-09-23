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
package org.bigbluebutton.modules.notes.services
{
  import flash.events.IEventDispatcher;
  
  import mx.collections.ArrayCollection;
  
  import org.bigbluebutton.modules.notes.events.SaveErrorEvent;
  import org.bigbluebutton.modules.notes.events.SaveSuccessEvent;
  import org.bigbluebutton.modules.notes.models.Note;
  import org.bigbluebutton.modules.notes.models.NotesModel;
  import org.bigbluebutton.modules.notes.models.NotesOptions;

  public class NotesMessageService
  {
    public var notesModel:NotesModel;
    
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
      notesModel.addNote(n);
      
      var noteSaver:NoteSaver = new NoteSaver(n, _options.saveURL, _dispatcher);
      _noteSavers.addItem(noteSaver);
      
      noteSaver.save();
      
    }
    
    public function saveError(event:SaveErrorEvent):void {
      // TODO: Re-save?
    }
    
    public function saveSuccess(event:SaveSuccessEvent):void {
      notesModel.noteSaved(event.noteID, event.timestamp);
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