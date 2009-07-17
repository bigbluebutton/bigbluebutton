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
package org.bigbluebutton.modules.deskShare.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.deskShare.DeskShareModuleConstants;
	import org.bigbluebutton.modules.deskShare.view.components.ToolbarButton;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	public class ToolbarButtonMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ToolbarButtonMediator";
		
		private var button:ToolbarButton;
		private var module:DeskShareModule;
		private var deskshareButtonDisplayed:Boolean;
		
		public function ToolbarButtonMediator(module:DeskShareModule)
		{
			super(NAME);
			this.module = module;
			button = new ToolbarButton();	
			button.enabled = true;	
			deskshareButtonDisplayed = false;	
			button.addEventListener(DeskShareModuleConstants.START_DESKSHARE_EVENT, onStartDeskShareEvent);			
		}
		
		private function onStartDeskShareEvent(e:Event):void {				
			facade.sendNotification(DeskShareModuleConstants.OPEN_WINDOW);
			button.enabled = false;	
		}
		
		override public function listNotificationInterests():Array
		{
			return [
				DeskShareModuleConstants.PARTICIPANT_IS_PRESENTER
			];
		}
		
		override public function handleNotification(notification:INotification):void
		{
			switch(notification.getName()){
				case DeskShareModuleConstants.PARTICIPANT_IS_PRESENTER:
					var showButton:Boolean = notification.getBody();
					if (showButton) {
						LogUtil.debug(NAME + ": Opening DeskShare Toolbar Button");
						facade.sendNotification(DeskShareModuleConstants.ADD_BUTTON, button);
						deskshareButtonDisplayed = true;
					} else {
						LogUtil.debug(NAME + ": Removing DeskShare Toolbar Button");
						if (deskshareButtonDisplayed) {
							facade.sendNotification(DeskShareModuleConstants.REMOVE_BUTTON, button);
							deskshareButtonDisplayed = false;
						}
					}
				break;
			}
		}
		
	}
}