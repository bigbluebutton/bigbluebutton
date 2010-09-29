/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Authors: Denis Zgonjanin <me.snap@gmail.com>
 *          Richard Alam <ritzalam@gmail.com> 
 * $Id: $
 */

package org.bigbluebutton.modules.deskshare.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.main.events.CloseWindowEvent;
	import org.bigbluebutton.main.events.OpenWindowEvent;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.events.ToolbarButtonEvent;
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
		}
	}
}