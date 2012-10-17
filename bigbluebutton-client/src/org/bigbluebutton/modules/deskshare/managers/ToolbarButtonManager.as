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

package org.bigbluebutton.modules.deskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopPublishWindow;
	import org.bigbluebutton.modules.deskshare.view.components.DesktopViewWindow;
	import org.bigbluebutton.modules.deskshare.view.components.ToolbarButton;
	import org.bigbluebutton.common.LogUtil;
			
	public class ToolbarButtonManager {		
		private var button:ToolbarButton;
		private var isSharing:Boolean = false;
		private var globalDispatcher:Dispatcher;
		
		private var buttonShownOnToolbar:Boolean = false;
		
		public function ToolbarButtonManager() {
			globalDispatcher = new Dispatcher();
			button = new ToolbarButton();			
		}
													
		public function addToolbarButton():void {
			LogUtil.debug("DeskShare::addToolbarButton");
			
			if ((button != null) && (!buttonShownOnToolbar)) {
				button = new ToolbarButton();
				   			   	
				var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
				event.button = button;
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
						
		public function enableToolbarButton():void {
			button.enabled = true;
			button.stopDeskshare();
		}
		
		public function disableToolbarButton():void {
			button.enabled = false;			
		}
	}
}