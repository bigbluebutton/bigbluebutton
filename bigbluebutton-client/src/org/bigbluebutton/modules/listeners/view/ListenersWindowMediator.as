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
package org.bigbluebutton.modules.listeners.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.listeners.ListenersModuleConstants;
	import org.bigbluebutton.modules.listeners.controller.notifiers.MuteNotifier;
	import org.bigbluebutton.modules.listeners.model.ListenersProxy;
	import org.bigbluebutton.modules.listeners.view.components.ListenersWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	/**
	 * The ListenersWindowMediator is a Mediator class for the ListenersWindow mxml component
	 * <p>
	 * This class extends the Mediator class of the PureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ListenersWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ListenersWindowMediator";
		
		private var _module:ListenersModule;
		private var _listenersWindow:ListenersWindow;
		
		public function ListenersWindowMediator(module:ListenersModule)
		{
			super(NAME);
			_module = module;
			_listenersWindow = new ListenersWindow();
			_listenersWindow.addEventListener(ListenersModuleConstants.UNMUTE_ALL, unmuteAllUsers);
			_listenersWindow.addEventListener(ListenersModuleConstants.MUTE_ALL, muteAllUsers);
			_listenersWindow.addEventListener(ListenersModuleConstants.EJECT_USER, ejectUser);
			_listenersWindow.addEventListener(ListenersModuleConstants.MUTE_USER, muteUser);
			
		}
		
		
		/**
		 *  
		 * @return The array of strings representing which notifications this class listens to
		 * <p>
		 * This class listens to the following notifications:
		 * 	MeetMeFacade.USER_JOIN_EVENT
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					ListenersModuleConstants.OPEN_WINDOW
					];
		}
		
		/**
		 * Decides how to handle a notification received by this class 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case ListenersModuleConstants.OPEN_WINDOW:
					handleOpenListenersWindow();
					break;
			}
		}

		private function handleOpenListenersWindow():void {
				_listenersWindow.listeners = proxy.listeners;
				_listenersWindow.width = 210;
		   		_listenersWindow.height = 220;
		   		_listenersWindow.title = "Viewers";
		   		_listenersWindow.showCloseButton = false;
		   		_listenersWindow.xPosition = 30;
		   		_listenersWindow.yPosition = 30;
		   		facade.sendNotification(ListenersModuleConstants.ADD_WINDOW, _listenersWindow); 			
		}	
		
		/**
		 * Sends a MUTE_ALL_USERS_COMMAND notification (false - unmutes all users)
		 * @param e - the event which generated the call to this method
		 * 
		 */		
		private function unmuteAllUsers(e:Event) : void
   		{
   			sendNotification(ListenersModuleConstants.MUTE_ALL_USERS_COMMAND, false);
   		}
   		
   		/**
   		 * Sends a MUTE_ALL_USERS_COMMAND notification (true - mutes all users)
   		 * @param e - the event which generated the call to this method
   		 * 
   		 */   		
   		private function muteAllUsers(e:Event) : void
   		{
   			sendNotification(ListenersModuleConstants.MUTE_ALL_USERS_COMMAND, true);
   		}
   		
   		/**
   		 * Sends an EJECT_USER_COMMAND notification 
   		 * @param e - the event which generated the call to this method
   		 * 
   		 */   		
   		private function ejectUser(e:Event):void{
 //  			sendNotification(ListenersModuleConstants.EJECT_USER_COMMAND, listenersWindow.userid);
   		}
   		
   		private function muteUser(e:Event):void{
//   			sendNotification(ListenersModuleConstants.MUTE_UNMUTE_USER_COMMAND,new MuteNotifier(listenersWindow.userid, listenersWindow.isMuted));
   		}

		private function get proxy():ListenersProxy {
			return facade.retrieveProxy(ListenersProxy.NAME) as ListenersProxy;
		}

	}
}