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
package org.bigbluebutton.modules.listeners.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import org.bigbluebutton.common.events.CloseWindowEvent;
	import org.bigbluebutton.common.events.OpenWindowEvent;
	import org.bigbluebutton.core.BBB;
	import org.bigbluebutton.modules.listeners.events.StartListenersModuleEvent;
	import org.bigbluebutton.modules.listeners.model.ListenerOptions;
	import org.bigbluebutton.modules.listeners.views.ListenersWindow;

	public class ListenersManager
	{		
		private var dispatcher:Dispatcher;
		private var listenersWindow:ListenersWindow;
		
		[Bindable]
		public var listenerOptions:ListenerOptions;
		
		public function ListenersManager(){
			dispatcher = new Dispatcher();
		}
		
		public function moduleStarted(event:StartListenersModuleEvent):void{
			if (listenersWindow == null){
				listenerOptions = new ListenerOptions();
				listenersWindow = new ListenersWindow();
				listenersWindow.listenerOptions = listenerOptions;
				
				var e:OpenWindowEvent = new OpenWindowEvent(OpenWindowEvent.OPEN_WINDOW_EVENT);
				e.window = listenersWindow;
				dispatcher.dispatchEvent(e);
			}
		}
		
		public function moduleEnded():void{
			var event:CloseWindowEvent = new CloseWindowEvent(CloseWindowEvent.CLOSE_WINDOW_EVENT);
			event.window = listenersWindow;
			dispatcher.dispatchEvent(event);
		}
	}
}