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
 * $Id: $
 */
package org.bigbluebutton.modules.video.view
{
	import flash.events.Event;
	
	import mx.managers.PopUpManager;
	
	import org.bigbluebutton.modules.video.VideoModuleConstants;
	import org.bigbluebutton.modules.video.view.components.SettingsWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class SettingsWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SettingsWindowMediator";
		public static const SETUP:String = "Setup Devices";
		
		public static const CANCEL_SETTINGS:String = "Cancel Settings Window";
		public static const CLOSE_SETTINGS:String = "Close Settings Window";
		
		public function SettingsWindowMediator(view:SettingsWindow)
		{
			super(NAME, view);
			view.addEventListener(SETUP, setupDevices);
			view.addEventListener(CANCEL_SETTINGS, cancelSettings);
			view.addEventListener(CLOSE_SETTINGS, closeSettings);
		}
		
		public function get window():SettingsWindow{
			return viewComponent as SettingsWindow;
		}
		
		override public function listNotificationInterests():Array{
			return [];
		}
		
		override public function handleNotification(notification:INotification):void{
			
		}
		
		private function setupDevices(e:Event):void{
//			sendNotification(VideoModuleConstants.SETUP_DEVICES_COMMAND);
//			var model:PublisherModel = facade.retrieveProxy(PublisherModel.NAME) as PublisherModel;
//			window.camera_cb.dataProvider = model.cameraNames;
		}
		
		private function cancelSettings(e:Event):void{
			PopUpManager.removePopUp(window);
		}
		
		private function closeSettings(e:Event):void{
			window.media.video.settings.cameraIndex = window.camera_cb.selectedIndex;
				
			PopUpManager.removePopUp(window);
			sendNotification(VideoModuleConstants.ENABLE_CAMERA);
		}

	}
}