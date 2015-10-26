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
package org.bigbluebutton.modules.sharednotes.services
{
  import flash.events.IEventDispatcher; 
  import flash.net.Responder;

  import mx.utils.ObjectUtil;

  import org.bigbluebutton.common.LogUtil;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.managers.ConnectionManager;

  public class MessageSender
  {
    private static const LOG:String = "SharedNotes::MessageSender - ";
    
    public var dispatcher:IEventDispatcher;
    
    private var onSuccessDebugger:Function = function(result:String):void {
          trace(result);
        };
    private var onErrorDebugger:Function = function(result:String):void {
          trace(result);
        };

    public function currentDocument():void {
      trace(LOG + "Sending [sharednotes.currentDocument] to server.");
      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "sharednotes.currentDocument",
        onSuccessDebugger,
        onErrorDebugger
      );
    }
    
    public function createAdditionalNotes(noteName:String):void {
      trace(LOG + "Sending [sharednotes.createAdditionalNotes] to server.");
      var message:Object = new Object();
      message["noteName"] = noteName;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "sharednotes.createAdditionalNotes",
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function destroyAdditionalNotes(notesId:String):void {
      trace(LOG + "Sending [sharednotes.destroyAdditionalNotes] to server.");
      var message:Object = new Object();
      message["noteID"] = notesId;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "sharednotes.destroyAdditionalNotes",
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function patchDocument(noteId:String, userid:String, patch:String):void {
      trace(LOG + "Sending [sharednotes.patchDocument] to server.");
      var message:Object = new Object();
      message["noteID"] = noteId;
      message["patch"] = patch;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "sharednotes.patchDocument",
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function requestAdditionalNotesSet(additionalNotesSetSize:Number):void {
      trace(LOG + "Sending [sharednotes.requestAdditionalNotesSet] to server.");
      var message:Object = new Object();
      message["additionalNotesSetSize"] = additionalNotesSetSize;

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage(
        "sharednotes.requestAdditionalNotesSet",
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }
  }
}