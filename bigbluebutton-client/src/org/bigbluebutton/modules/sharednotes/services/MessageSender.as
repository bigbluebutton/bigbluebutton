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
package org.bigbluebutton.modules.sharednotes.services {
  import org.as3commons.logging.api.ILogger;
  import org.as3commons.logging.api.getClassLogger;
  import org.bigbluebutton.core.BBB;
  import org.bigbluebutton.core.UsersUtil;
  import org.bigbluebutton.core.managers.ConnectionManager;

  public class MessageSender {
    private static const LOGGER:ILogger = getClassLogger(MessageSender);

    private var onSuccessDebugger:Function = function(result:String):void {
      LOGGER.debug(result);
    };

    private var onErrorDebugger:Function = function(result:String):void {
      LOGGER.debug(result);
    };

    public function currentDocument():void {
      var message:Object = {
        header: {name: "GetSharedNotesPubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function createAdditionalNotes(noteName: String):void {
      var message:Object = {
        header: {name: "CreateSharedNoteReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {noteName: noteName}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function destroyAdditionalNotes(noteId: String):void {
      var message:Object = {
        header: {name: "DestroySharedNoteReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {noteId: noteId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function patchDocument(noteId: String, patch: String, operation: String):void {
      var message:Object = {
        header: {name: "UpdateSharedNoteReqMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {noteId: noteId, patch: patch, operation: operation}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function sharedNotesSyncNoteRequest(noteId: String):void {
      var message:Object = {
        header: {name: "SyncSharedNotePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {noteId: noteId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }

    public function sharedNotesClearNoteRequest(noteId: String):void {
      var message:Object = {
        header: {name: "ClearSharedNotePubMsg", meetingId: UsersUtil.getInternalMeetingID(), userId: UsersUtil.getMyUserID()},
        body: {noteId: noteId}
      };

      var _nc:ConnectionManager = BBB.initConnectionManager();
      _nc.sendMessage2x(
        onSuccessDebugger,
        onErrorDebugger,
        message
      );
    }
  }
}
