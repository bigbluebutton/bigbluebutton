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

package org.bigbluebutton.modules.sharednotes.maps
{
	import com.asfusion.mate.events.Dispatcher;
	
	import mx.binding.utils.BindingUtils;
	import mx.utils.ObjectUtil;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.model.LiveMeeting;
	import org.bigbluebutton.main.events.BBBEvent;
	import org.bigbluebutton.modules.sharednotes.SharedNotesOptions;
	import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.modules.sharednotes.views.AdditionalSharedNotesWindow;
	import org.bigbluebutton.modules.sharednotes.views.SharedNotesWindow;

	public class SharedNotesEventMapDelegate {
		private static const LOGGER:ILogger = getClassLogger(SharedNotesEventMapDelegate);

		private var globalDispatcher:Dispatcher;

		private var windows:Array = [];
		private var window:SharedNotesWindow;

		private var options:SharedNotesOptions = new SharedNotesOptions();

		public function SharedNotesEventMapDelegate() {
			globalDispatcher = new Dispatcher();
			window = new SharedNotesWindow();
		}

		public function addRemoteDocuments(e:CurrentDocumentEvent):void {
			window.addRemoteDocument(e.document, e.isNotesLimit);
			for(var id:String in e.document){
				LOGGER.debug("NoteId:" + id +":"+e.document[id] + ":" + e.type);
				if (id != window.noteId && !windows.hasOwnProperty(id)) {
					createAdditionalNotes(id, "");
					SharedNotesWindow(windows[id]).addRemoteDocument(e.document, e.isNotesLimit);
				}
			}

			BindingUtils.bindSetter(openAdditionalNotesSet, LiveMeeting.inst().sharedNotes, "numAdditionalSharedNotes");
		}

		private function openAdditionalNotesSet(numAdditionalSharedNotes:Number):void {
			var extraNotes : Number = numAdditionalSharedNotes - numExistentsAdditionalNotes();
			if (extraNotes > 0) {
				var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.REQUEST_ADDITIONAL_NOTES_SET_EVENT);
				e.payload.numAdditionalSharedNotes = extraNotes;
				globalDispatcher.dispatchEvent(e);
			}
		}

		public function addMainWindow():void {
			var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			openEvent.window = window;
			globalDispatcher.dispatchEvent(openEvent);
		}

		private function get windowsAsString():String {
			return ObjectUtil.toString(windows).split("\n").filter(function(element:*, index:int, arr:Array):Boolean {
				return element.substring(0, 4) != "    ";
			}).join("\n");
		}

		public function createAdditionalNotes(notesId:String, noteName:String):void {
			LOGGER.debug(": creating additional notes " + notesId);

			if(!windows.hasOwnProperty(notesId)) {
				var newWindow:AdditionalSharedNotesWindow = new AdditionalSharedNotesWindow(notesId);
				newWindow.noteName = noteName;
				windows[notesId] = newWindow;

				var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				openEvent.window = newWindow;
				globalDispatcher.dispatchEvent(openEvent);
			}
		}

		public function destroyAdditionalNotes(notesId:String):void {
			LOGGER.debug(": destroying additional notes, notesId: " + notesId);

			var destroyWindow:AdditionalSharedNotesWindow = windows[notesId];
			if (destroyWindow != null) {
				LOGGER.debug(": notes found, removing window");

				var closeEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
				closeEvent.window = destroyWindow;
				globalDispatcher.dispatchEvent(closeEvent);

				LOGGER.debug(": removing from windows list");
				delete windows[notesId];
			}
		}

		public function destroyAllAdditionalNotes(e:BBBEvent):void {
			if (e.payload.type == "BIGBLUEBUTTON_CONNECTION") {
				for (var noteId:String in windows) destroyAdditionalNotes(noteId);
			}
		}

		public function stopSharedNotesRemoveAll():void {
			//remove the additional
			for (var noteId:String in windows) destroyAdditionalNotes(noteId);
			//remove the main window
			var closeEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			closeEvent.window = window;
			globalDispatcher.dispatchEvent(closeEvent);
		}

		private function numExistentsAdditionalNotes():Number {
			var notesCounter:Number = 0;
			for (var noteId:String in windows) notesCounter++;
			return notesCounter;
		}
	}
}
