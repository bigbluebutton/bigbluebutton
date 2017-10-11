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
package org.bigbluebutton.modules.notes.maps
{
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