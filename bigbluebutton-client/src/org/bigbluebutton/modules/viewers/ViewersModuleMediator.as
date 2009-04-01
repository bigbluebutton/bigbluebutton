/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.modules.viewers
{  
	import org.bigbluebutton.modules.viewers.model.vo.User;
	import org.bigbluebutton.modules.viewers.view.ViewersWindowMediator;
	import org.bigbluebutton.modules.viewers.view.components.ViewersWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;

	
	/**
	 * This is the mediator class for the ViewersModule class
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ViewersModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewersModuleMediator";
		
		private var module:ViewersModule;
		private var viewersWindow:ViewersWindow;
		
		/**
		 * The constructor. registers this mediator with the ViewersModuel 
		 * @param module
		 * 
		 */		
		public function ViewersModuleMediator(module:ViewersModule)
		{
			super(NAME, module);
			this.module = module;
		}
				

		/**
		 * Send a login complete notice 
		 * 
		 */		
		private function sendLoginCompleteNotice():void{
			LogUtil.debug("Sending LOGIN_COMPLETE");

		}
		
		private function sendLogoutCommand(reason:String):void{

		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}
		
		/**
		 * Lists the notifications to which this mediator listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					ViewersModuleConstants.LOGGED_IN,
					ViewersModuleConstants.LOGGED_OUT
					];
		}
		
		private function openViewCamera(usr:User):void{

		}
		
		/**
		 * Handles the notifications as they're received 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()) {
				case ViewersModuleConstants.LOGGED_OUT:
					sendNotification(ViewersModuleConstants.CLOSE_VIEWERS_WINDOW);
					if (facade.hasMediator(ViewersWindowMediator.NAME)) {
						facade.removeMediator(ViewersWindowMediator.NAME); 
					}					
					break;
				case ViewersModuleConstants.LOGGED_IN:
					if (! facade.hasMediator(ViewersWindowMediator.NAME)) {
						facade.registerMediator(new ViewersWindowMediator()); 
					}
					sendNotification(ViewersModuleConstants.OPEN_VIEWERS_WINDOW);
					break;
			}
		}

	}
}