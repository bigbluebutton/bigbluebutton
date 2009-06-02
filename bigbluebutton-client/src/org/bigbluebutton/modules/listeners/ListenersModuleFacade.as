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
package org.bigbluebutton.modules.listeners
{	
	import org.bigbluebutton.modules.listeners.controller.StartupCommand;
	import org.bigbluebutton.modules.listeners.controller.StopCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
		
	/**
	 * The  MeetMeFacade is the main Facade of the MeetMe module. It extends the Facade class of the PureMVC
	 * framework
	 * @author dev_team@bigbluebutton.org
	 * 
	 */	
	public class ListenersModuleFacade extends Facade implements IFacade
	{
		public static const NAME : String = "ListenersModuleFacade";
		public static const STARTUP:String = "STARTUP";
		public static const STOP:String = "STOP";
				
		public function ListenersModuleFacade()
		{
			super(NAME);		
		}
		
		/**
		 *  
		 * @return The instance of MeetMeFacade singleton class
		 * 
		 */		
		public static function getInstance():ListenersModuleFacade
		{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new ListenersModuleFacade();
			return instanceMap[NAME] as ListenersModuleFacade;
	   	}		
	   	
	   	/**
	   	 * Initializes the controller part of this MVC module 
	   	 * 
	   	 */	   	
	   	override protected function initializeController():void{
	   		super.initializeController();
	   		registerCommand(STARTUP, StartupCommand);
	   		registerCommand(STOP, StopCommand);
	   	}
	   	
	   	/**
	   	 * Sends out a notification to start the command which initiates the mediators and the proxies 
	   	 * @param app
	   	 * 
	   	 */	   	
	   	public function startup(m:ListenersModule):void{
	   		sendNotification(STARTUP, m);
	   	}
	   	
	   	public function stop(m:ListenersModule):void{
			sendNotification(STOP, m);
			removeCore(NAME);
		}
	}
}