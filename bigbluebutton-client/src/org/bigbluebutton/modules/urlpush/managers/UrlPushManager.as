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
package org.bigbluebutton.modules.urlpush.managers
{
	import com.asfusion.mate.events.Dispatcher;
	
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.navigateToURL;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.common.IBbbModuleWindow;
	import org.bigbluebutton.common.LogUtil;
	import org.bigbluebutton.core.managers.UserManager;
	import org.bigbluebutton.main.events.MadePresenterEvent;
	import org.bigbluebutton.main.model.users.BBBUser;
	import org.bigbluebutton.modules.urlpush.UrlPushWindow;
	import org.bigbluebutton.modules.urlpush.events.UrlPushEvent;
	import org.bigbluebutton.modules.urlpush.events.UrlPushWindowEvent;
	import org.bigbluebutton.modules.urlpush.events.UrlPushModuleEvent;
	import org.bigbluebutton.common.events.ToolbarButtonEvent;
	import org.bigbluebutton.modules.urlpush.ToolbarButton;
	
	public class UrlPushManager
	{
		private var dispatcher:Dispatcher;
		private var urlPushWindow:UrlPushWindow;

		
		public function UrlPushManager():void{
			dispatcher = new Dispatcher();
		}
		
		public function handleStartModule(e:UrlPushModuleEvent):void{
			// add url push button to application tool bar
			var button:ToolbarButton = new ToolbarButton();
			
			var event:ToolbarButtonEvent = new ToolbarButtonEvent(ToolbarButtonEvent.ADD);
			event.button = button;
			dispatcher.dispatchEvent(event);
			
		}
		
		public function handleOpenUrlPushWindow(e:UrlPushWindowEvent):void{
			if (urlPushWindow != null) return;
			
			urlPushWindow = new UrlPushWindow();
			
			PopUpManager.addPopUp(urlPushWindow, e.parentWindow, true);
			PopUpManager.centerPopUp(urlPushWindow);
		}
		
		public function handleCloseUrlPushWindow():void{
			PopUpManager.removePopUp(urlPushWindow);
			urlPushWindow = null;
		}
		
		
		
		public function gotoUrl(e:UrlPushEvent):void{
//			if (UserManager.getInstance().getConference().amIPresenter()) {
//				return;
//			}

			navigateToURL(new URLRequest(e.url), "_blank");			
		}
	}
}
