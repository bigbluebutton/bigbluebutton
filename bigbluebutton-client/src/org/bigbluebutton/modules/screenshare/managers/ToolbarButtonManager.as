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

package org.bigbluebutton.modules.screenshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.as3commons.logging.api.ILogger;
	import org.as3commons.logging.api.getClassLogger;
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.screenshare.view.components.ToolbarButton;
			
	public class ToolbarButtonManager {
		private static const LOGGER:ILogger = getClassLogger(ToolbarButtonManager);
    
		private var button:ToolbarButton;
		private var isSharing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		private var buttonShownOnToolbar:Boolean = false;
		
		public function ToolbarButtonManager() {
			globalDispatcher = new Dispatcher();
			button = new ToolbarButton();			
		}
													
		public function addToolbarButton():void {
      LOGGER.debug("DeskShare::addToolbarButton");
			
			if ((button != null) && (!buttonShownOnToolbar)) {
				button = new ToolbarButton();
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
				event.button = button;
				event.module="DeskShare";
				globalDispatcher.dispatchEvent(event);
				buttonShownOnToolbar = true;
				button.enabled = true;
			}
		}
			
		public function removeToolbarButton():void {
			if (buttonShownOnToolbar) {
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.REMOVE);
				event.button = button;
				globalDispatcher.dispatchEvent(event);
				buttonShownOnToolbar = false;
			}
		}
		//OLD - CAN BE DELETED				
		public function enableToolbarButton():void {
			button.enabled = true;
			button.stopDeskshare();
		}
		//OLD - CAN BE DELETED
		public function disableToolbarButton():void {
			button.enabled = false;			
		}

		public function startedSharing():void {
			button.deskshareStatus(ToolbarButton.START_SHARING);
		}

		public function stoppedSharing():void {
			button.deskshareStatus(ToolbarButton.STOP_SHARING);
		}
	}
}
