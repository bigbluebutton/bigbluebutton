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
package org.bigbluebutton.modules.chat
{
	import flash.system.Capabilities;
	
	import flexlib.mdi.containers.MDIWindow;
	
	import org.bigbluebutton.common.BigBlueButtonModule;
	import org.bigbluebutton.common.IRouterAware;
	import org.bigbluebutton.common.Router;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.bigbluebutton.modules.chat.view.ChatModuleMediator;
	import org.bigbluebutton.modules.chat.view.components.ChatWindow;
	import org.bigbluebutton.modules.log.LogModuleFacade;

	/**
	 * 
	 * Class ChatModule acts as view component for Chat Application
	 * 
	 */	
	public class ChatModule extends BigBlueButtonModule implements IRouterAware
	{
		public static const NAME:String = 'ChatModule';
		public var chatWindow : ChatWindow;
		private var facade : ChatFacade;		
		private var log : LogModuleFacade = LogModuleFacade.getInstance("LogModule");
		
		public var activeWindow:MDIWindow;
		
		/**
		 * costructor of class ChatModule 
		 * 
		 */		
		public function ChatModule()
		{
			super(NAME);
			log.debug("Creating new ChatWindow...");
			chatWindow = new ChatWindow;
			log.debug("Getting an instance of Chat Facade...");
			facade = ChatFacade.getInstance();			
			this.preferedX = Capabilities.screenResolutionX - 410;
			this.preferedY = 20;
		}
		/**
		 * 
		 * @param router
		 * @param shell
		 * 
		 */		
		override public function acceptRouter(router : Router, shell : MainApplicationShell) : void
		{
			super.acceptRouter(router, shell);
			log.debug("Setting Router for Chat Module...");
			ChatFacade(facade).startup(this);						
		}
		
		override public function getMDIComponent():MDIWindow{
			return activeWindow;
		}
		
		override public function logout():void{
		//	var presentation:PresentationApplication = 
		//		facade.retrieveMediator(PresentationApplication.NAME) as PresentationApplication;
				
		//	presentation.leave();
			
			facade.removeCore(ChatFacade.NAME);
		}
	}
}