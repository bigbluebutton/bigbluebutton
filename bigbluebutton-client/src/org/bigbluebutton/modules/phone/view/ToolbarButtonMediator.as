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
package org.bigbluebutton.modules.phone.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.phone.PhoneModuleConstants;
	import org.bigbluebutton.modules.phone.Red5Manager;
	import org.bigbluebutton.modules.phone.view.components.ToolbarButton;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class ToolbarButtonMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ToolbarButtonMediator";
		
		private var button:ToolbarButton;
		private var module:PhoneModule;
		private var red5Manager:Red5Manager;
		
		public function ToolbarButtonMediator(module:PhoneModule)
		{
			super(NAME);
			this.module = module;
			button = new ToolbarButton();			
			button.addEventListener(PhoneModuleConstants.START_PHONE_EVENT, onStartPhoneEvent);			
		}
		
		private function onStartPhoneEvent(e:Event):void {
			button.enabled = false;	
			var uid:String = String( Math.floor( new Date().getTime() ) );		
			red5Manager = new Red5Manager(uid, module.username, module.voicebridge, module.uri);
			red5Manager.connectRed5();
		}
		
		private function onMyCameraWindowClose(e:Event):void {
			button.enabled = true;
		}
		
		override public function listNotificationInterests():Array
		{
			return [
				PhoneModuleConstants.CONNECTED
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case PhoneModuleConstants.CONNECTED:
					LogUtil.debug(NAME + ": Opening Phone Toolbar Button");
					facade.sendNotification(PhoneModuleConstants.ADD_BUTTON, button);
				break;
			}
		}
		
	}
}