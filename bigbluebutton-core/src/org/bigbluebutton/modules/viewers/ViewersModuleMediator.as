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
	import flash.system.Capabilities;
	
	import org.bigbluebutton.common.InputPipe;
	import org.bigbluebutton.common.OutputPipe;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.MainApplicationConstants;
	import org.bigbluebutton.modules.log.LogModule;
	import org.bigbluebutton.modules.log.LogModuleFacade;
	import org.bigbluebutton.modules.viewers.view.JoinWindow;
	import org.bigbluebutton.modules.viewers.view.ViewersWindow;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	import org.puremvc.as3.multicore.utilities.pipes.interfaces.IPipeMessage;
	import org.puremvc.as3.multicore.utilities.pipes.messages.Message;
	import org.puremvc.as3.multicore.utilities.pipes.plumbing.PipeListener;
	
	/**
	 * This is the mediator class for the ViewersModule class
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class ViewersModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "ViewersModuleMediator";
		
		private var outpipe : OutputPipe;
		private var inpipe : InputPipe;
		private var router : Router;
		private var inpipeListener : PipeListener;
		
		private var module:ViewersModule;
		private var joinWindow:JoinWindow;
		private var viewersWindow:ViewersWindow;
		
		private var log:LogModuleFacade = LogModuleFacade.getInstance(LogModule.NAME);
		
		/**
		 * The constructor. registers this mediator with the ViewersModuel 
		 * @param module
		 * 
		 */		
		public function ViewersModuleMediator(module:ViewersModule)
		{
			super(NAME, module);
			this.module = module;
			router = module.router;
			inpipe = new InputPipe(ViewersConstants.TO_VIEWERS_MODULE);
			outpipe = new OutputPipe(ViewersConstants.FROM_VIEWERS_MODULE);
			inpipeListener = new PipeListener(this, messageReceiver);
			router.registerOutputPipe(outpipe.name, outpipe);
			router.registerInputPipe(inpipe.name, inpipe);
			addJoinWindow();
		}
		
		private function messageReceiver(message:IPipeMessage):void{
			var msg:String = message.getHeader().MSG;
		}
		
		/**
		 * Adds the login gui part of this module to the main application shell 
		 * 
		 */		
		private function addJoinWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: ViewersConstants.FROM_VIEWERS_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			joinWindow = new JoinWindow();
   			joinWindow.showCloseButton = false;
   			joinWindow.title = JoinWindow.TITLE;
   			
   			module.preferedX = Capabilities.screenResolutionX/2 - 328/2;
			module.preferedY = Capabilities.screenResolutionY/2 - 265;
   			module.activeWindow = joinWindow;
   			
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		/**
		 *  Adds the viewers gui part of this module to the main application shell
		 * 
		 */		
		private function addViewersWindow():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.ADD_WINDOW_MSG, SRC: ViewersConstants.FROM_VIEWERS_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			viewersWindow = new ViewersWindow();
   			
   			module.preferedX = 20;
   			module.preferedY = 20;
   			module.activeWindow = viewersWindow;
   			
   			viewersWindow.width = 210;
   			viewersWindow.height = 220;
   			viewersWindow.title = ViewersWindow.TITLE;
   			viewersWindow.showCloseButton = false;
   			sendNotification(ViewersFacade.START_VIEWER_WINDOW, viewersWindow);
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		/**
		 * Removes the login window from the main application shell once login is completed 
		 * 
		 */		
		private function removeJoinWindow():void{
			module.activeWindow = joinWindow;
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.REMOVE_WINDOW_MSG, SRC: ViewersConstants.FROM_VIEWERS_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			msg.setBody(module);
   			outpipe.write(msg);
		}
		
		/**
		 * Send a login complete notice 
		 * 
		 */		
		private function sendLoginCompleteNotice():void{
			var msg:IPipeMessage = new Message(Message.NORMAL);
			msg.setHeader({MSG:MainApplicationConstants.LOGIN_COMPLETE, SRC: ViewersConstants.FROM_VIEWERS_MODULE,
   						TO: MainApplicationConstants.TO_MAIN });
   			msg.setPriority(Message.PRIORITY_HIGH);
   			
   			outpipe.write(msg);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
			sendNotification(ViewersFacade.START_LOGIN_WINDOW, joinWindow);
		}
		
		/**
		 * Lists the notifications to which this mediator listens to 
		 * @return 
		 * 
		 */		
		override public function listNotificationInterests():Array{
			return [
					ViewersFacade.CONNECT_SUCCESS,
					ViewersFacade.DEBUG
					];
		}
		
		/**
		 * Handles the notifications as they're received 
		 * @param notification
		 * 
		 */		
		override public function handleNotification(notification:INotification):void{
			switch(notification.getName()){
				case ViewersFacade.CONNECT_SUCCESS:
					removeJoinWindow();
					addViewersWindow();
					sendLoginCompleteNotice();
					break;
				case ViewersFacade.DEBUG:
					log.debug(notification.getBody() as String);
					break;
			}
		}

	}
}