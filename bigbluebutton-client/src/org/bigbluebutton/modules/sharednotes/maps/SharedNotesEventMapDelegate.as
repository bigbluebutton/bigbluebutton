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

	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.modules.sharednotes.views.SharedNotesWindow;
	import org.bigbluebutton.modules.sharednotes.views.AdditionalSharedNotesWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.modules.sharednotes.SharedNotesOptions;
	import org.bigbluebutton.modules.sharednotes.events.JoinSharedNotesEvent;
	import org.bigbluebutton.modules.sharednotes.events.CurrentDocumentEvent;
	import org.bigbluebutton.modules.sharednotes.events.SharedNotesEvent;
	import org.bigbluebutton.common.LogUtil;
	
	public class SharedNotesEventMapDelegate {
		public static const NAME:String = "SharedNotesController";

		private var globalDispatcher:Dispatcher;

		private var windows:Array = [];
		private var window:SharedNotesWindow;

		private var options:SharedNotesOptions = new SharedNotesOptions();
		
		public function SharedNotesEventMapDelegate() {
			globalDispatcher = new Dispatcher();
			window = new SharedNotesWindow();
		}
        
        public function addRemoteDocuments(e:CurrentDocumentEvent):void{
            window.addRemoteDocument(e.document);
            for(var id:String in e.document){
                LogUtil.debug("NoteId:" + id +":"+e.document[id] + ":" + e.type);
                if(id != window.noteId && !windows.hasOwnProperty(id)){
                    createAdditionalNotes(id);
                    windows[id].addRemoteDocument(e.document);
                }
            }

            BindingUtils.bindSetter(openAdditionalNotesSet, UserManager.getInstance().getConference(), "numAdditionalSharedNotes");
        }

        private function openAdditionalNotesSet(numAdditionalSharedNotes:Number):void {
            var e:SharedNotesEvent = new SharedNotesEvent(SharedNotesEvent.REQUEST_ADDITIONAL_NOTES_SET_EVENT);
            e.payload.numAdditionalSharedNotes = numAdditionalSharedNotes;
            globalDispatcher.dispatchEvent(e);
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

		public function createAdditionalNotes(notesId:String):void {
			trace(NAME + ": creating additional notes " + notesId);

			if(!windows.hasOwnProperty(notesId)) {
				var newWindow:AdditionalSharedNotesWindow = new AdditionalSharedNotesWindow(notesId);
				windows[notesId] = newWindow;

				var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				openEvent.window = newWindow;
				globalDispatcher.dispatchEvent(openEvent);
			}
		}

		public function destroyAdditionalNotes(notesId:String):void {
			trace(NAME + ": destroying additional notes, notesId: " + notesId);

			var destroyWindow:AdditionalSharedNotesWindow = windows[notesId];
			if (destroyWindow != null) {
				trace(NAME + ": notes found, removing window");

				var closeEvent:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
				closeEvent.window = destroyWindow;
				globalDispatcher.dispatchEvent(closeEvent);

				trace(NAME + ": removing from windows list");
				delete windows[notesId];
			}
		}
		
	}
}
