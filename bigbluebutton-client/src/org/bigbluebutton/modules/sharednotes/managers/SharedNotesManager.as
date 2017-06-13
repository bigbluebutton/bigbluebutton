/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
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

package org.bigbluebutton.modules.sharednotes.managers {
	import com.asfusion.mate.events.Dispatcher;

	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.modules.sharednotes.events.SendPatchEvent;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.modules.sharednotes.services.MessageReceiver;
	import org.bigbluebutton.modules.sharednotes.services.MessageSender;
	import org.bigbluebutton.core.managers.UserManager;

	public class SharedNotesManager {
		private static const LOGGER:ILogger = getClassLogger(SharedNotesManager);

		public var sender:MessageSender;
		public var receiver:MessageReceiver;
		private var attributes:Object;

		public function SharedNotesManager() {}

		public function setModuleAttributes(attributes:Object):void {
			this.attributes = attributes;
		}

		public function patchDocument(e:SendPatchEvent):void {
			sender.patchDocument(e.noteId, UserManager.getInstance().getConference().getMyUserId(), e.patch, e.operation);
		}

		public function getCurrentDocument():void {
			sender.currentDocument();
		}

		public function createAdditionalNotes(e:SharedNotesEvent):void {
			sender.createAdditionalNotes(e.noteName);
		}

		public function destroyAdditionalNotes(notesId:String):void {
			LOGGER.debug("SharedNotesManager: destroying notes " + notesId);
			sender.destroyAdditionalNotes(notesId);
		}

		public function requestAdditionalNotesSet(e:SharedNotesEvent):void {
			var notesSet:Number = e.payload.numAdditionalSharedNotes;
			LOGGER.debug("SharedNotesManager: requested to open a new notes set");
			LOGGER.debug("SharedNotesManager: set size: " + notesSet);
			sender.requestAdditionalNotesSet(notesSet);
		}

		public function sharedNotesSyncNoteRequest(e:SharedNotesEvent):void {
			var noteId:String = e.payload.noteId;
			sender.sharedNotesSyncNoteRequest(noteId);
		}
	}
}
