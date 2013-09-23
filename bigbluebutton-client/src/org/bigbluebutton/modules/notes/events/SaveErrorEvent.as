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
package org.bigbluebutton.modules.notes.events
{
  import flash.events.Event;
  
  public class SaveErrorEvent extends Event
  {
    public static const NOTE_SAVE_ERROR:String = "note save error event";
    
    public static const SUCCESS:String = "note save success event";
    public static const FAILED_TO_SAVE:String = "note failed to save event";
    public static const SECURITY_ERROR:String = "note security error event";
    public static const IO_ERROR:String       = "note io error event";
    
    public var reason:String;
    public var noteID:String;
    
    public function SaveErrorEvent(bubbles:Boolean=true, cancelable:Boolean=false)
    {
      super(NOTE_SAVE_ERROR, bubbles, cancelable);
    }
  }
}