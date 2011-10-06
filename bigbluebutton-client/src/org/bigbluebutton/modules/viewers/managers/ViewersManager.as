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
package org.bigbluebutton.modules.viewers.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleEndEvent;
	import org.bigbluebutton.modules.viewers.events.ViewersModuleStartedEvent;
	import org.bigbluebutton.modules.viewers.model.ViewerOptions;
	import org.bigbluebutton.modules.viewers.views.ViewersWindow;

	public class ViewersManager
	{
		private var viewersWindow:ViewersWindow;
		private var dispatcher:Dispatcher;
		
		private var _module:ViewersModule;
		[Bindable]
		private var viewerOptions:ViewerOptions;
		
		public function ViewersManager(){
			dispatcher = new Dispatcher();
		}
		
		public function moduleStarted(e:ViewersModuleStartedEvent):void{
			_module = e.module;

			viewerOptions = new ViewerOptions();
			
			var vxml:XML = BBB.getConfigForModule("ViewersModule");
			if (vxml != null) {
				viewerOptions.windowVisible = (vxml.@windowVisible.toString().toUpperCase() == "TRUE") ? true : false;
			}
			
			if (viewersWindow == null){
				viewersWindow = new ViewersWindow();
				viewersWindow.viewerOptions = viewerOptions;
				
				var windowEvent:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				windowEvent.window = viewersWindow;
				dispatcher.dispatchEvent(windowEvent);
			}
		}
		
		public function moduleEnded(e:ViewersModuleEndEvent):void{
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = viewersWindow;
			dispatcher.dispatchEvent(event);
		}
	}
}