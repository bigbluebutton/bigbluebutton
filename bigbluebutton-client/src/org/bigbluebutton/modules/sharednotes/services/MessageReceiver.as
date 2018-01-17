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
  import flash.events.TimerEvent;
  import flash.utils.Timer;
  
  import mx.collections.ArrayCollection;
  
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.model.LiveMeeting;
  import org.bigbluebutton.main.model.users.IMessageListener;
  import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
  import org.bigbluebutton.modules.sharednotes.events.ReceivePatchEvent;
  import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;

  public class MessageReceiver implements IMessageListener {
    private static const LOGGER:ILogger = getClassLogger(MessageReceiver);

    private var buffering:Boolean = true;
    private var patchDocumentBuffer:ArrayCollection = new ArrayCollection();
    private var bufferingTimeout:Timer = new Timer(5000, 1);
    private var bufferReader:Timer = new Timer(1000, 1);
    public var dispatcher:IEventDispatcher;

    public function MessageReceiver() {
      BBB.initConnectionManager().addMessageListener(this);
      bufferingTimeout.addEventListener(TimerEvent.TIMER, endBuffering);
      bufferReader.addEventListener(TimerEvent.TIMER, consumeBuffer);
    }

    public function onMessage(messageName:String, message:Object):void {
      switch (messageName) {
        case "UpdateSharedNoteRespMsg":
          if (buffering || patchDocumentBuffer.length != 0) {
            patchDocumentBuffer.addItem(message);
            if (!bufferReader.running) {
              bufferReader.start();
            }
          } else {
            handleUpdateSharedNoteRespMsg(message);
          }
          break;
        case "GetSharedNotesEvtMsg":
          handleGetSharedNotesEvtMsg(message);
          bufferingTimeout.start();
          break;
        case "CreateSharedNoteRespMsg":
          handleCreateSharedNoteRespMsg(message);
          break;
        case "DestroySharedNoteRespMsg":
          handleDestroySharedNoteRespMsg(message);
          break;
        case "SyncSharedNoteEvtMsg":
          handleSyncSharedNoteEvtMsg(message);
          break;
        default:
           break;
      }
    }

    private function endBuffering(e:TimerEvent):void {
      buffering = false;
    }

    private function consumeBuffer(e:TimerEvent):void {
      while (patchDocumentBuffer.length > 0) {
        handleUpdateSharedNoteRespMsg(patchDocumentBuffer.removeItemAt(0));
      }
    }

    private function handleUpdateSharedNoteRespMsg(msg: Object):void {
      var userId:String = msg.header.userId as String;
      var receivePatchEvent:ReceivePatchEvent = new ReceivePatchEvent();
      if (userId != UsersUtil.getMyUserID()) {
        receivePatchEvent.patch = msg.body.patch as String;
      } else {
        receivePatchEvent.patch = "";
      }
      receivePatchEvent.userId = userId;
      receivePatchEvent.noteId = msg.body.noteId as String;
      receivePatchEvent.patchId = msg.body.patchId as int;
      receivePatchEvent.undo = msg.body.undo as Boolean;
      receivePatchEvent.redo = msg.body.redo as Boolean;
      dispatcher.dispatchEvent(receivePatchEvent);
    }

    private function handleGetSharedNotesEvtMsg(msg: Object):void {
      var currentDocumentEvent:CurrentDocumentEvent = new CurrentDocumentEvent();
      currentDocumentEvent.document = msg.body.notesReport as Object;
      currentDocumentEvent.isNotesLimit = msg.body.isNotesLimit as Boolean;
      dispatcher.dispatchEvent(currentDocumentEvent);
      LiveMeeting.inst().sharedNotes.updateNotesIds(msg.body.notesReport as Object);
    }

    private function handleCreateSharedNoteRespMsg(msg: Object):void {
      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.CREATE_ADDITIONAL_NOTES_REPLY_EVENT);
      e.payload.notesId = msg.body.noteId as String;
      e.payload.noteName = msg.body.noteName as String;
      e.payload.isNotesLimit = msg.body.isNotesLimit as Boolean;
      dispatcher.dispatchEvent(e);
      LiveMeeting.inst().sharedNotes.addNewSharedNote(Number(msg.body.noteId as String));
    }

    private function handleDestroySharedNoteRespMsg(msg: Object):void {
      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.DESTROY_ADDITIONAL_NOTES_REPLY_EVENT);
      e.payload.notesId = msg.body.noteId as String;
      e.payload.isNotesLimit = msg.body.isNotesLimit as Boolean;
      dispatcher.dispatchEvent(e);
      LiveMeeting.inst().sharedNotes.removeSharedNote(Number(msg.body.noteId as String));
    }

    private function handleSyncSharedNoteEvtMsg(msg: Object):void {
      var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.SYNC_NOTE_REPLY_EVENT);
      e.payload.noteId = msg.body.noteId as String;
      e.payload.note = msg.body.noteReport as Object;
      dispatcher.dispatchEvent(e);
    }
  }
}
