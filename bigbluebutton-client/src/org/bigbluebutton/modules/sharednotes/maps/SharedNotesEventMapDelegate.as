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
	
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.modules.sharednotes.views.ToolbarButton;
	import org.bigbluebutton.modules.sharednotes.views.SharedNotesWindow;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	
	public class SharedNotesEventMapDelegate {
		private var sharedNotesButton:ToolbarButton;
		private var globalDispatcher:Dispatcher;
		private var window:SharedNotesWindow;
		
		public function SharedNotesEventMapDelegate() {
			sharedNotesButton = new ToolbarButton();
			globalDispatcher = new Dispatcher();
			window = new SharedNotesWindow();
			hideWindow();
		}

		public function showWindow():void {
			window.visible = true;
		}

		public function hideWindow():void {
			window.visible = false;
		}

		public function addWindow():void {
			var openEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
			openEvent.window = window;
			globalDispatcher.dispatchEvent(openEvent);
		}
		
		public function addToolbarButton():void {
			var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			event.button = sharedNotesButton;
			globalDispatcher.dispatchEvent(event);	

			
			window.visible = false;
	   	
		}
		
		public function removeToolbarButton():void {
			var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.REMOVE);
			event.button = sharedNotesButton;
			globalDispatcher.dispatchEvent(event);
		}
	}
}
