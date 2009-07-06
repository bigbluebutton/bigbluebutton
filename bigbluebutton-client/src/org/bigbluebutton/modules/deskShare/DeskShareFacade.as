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
package org.bigbluebutton.modules.deskShare
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.deskShare.controller.StartupCommand;
	import org.bigbluebutton.modules.deskShare.controller.StopCommand;
	import org.bigbluebutton.modules.deskShare.view.DeskShareWindowMediator;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * The DeskShareFacade is the facade class for the DeskShareModule 
	 * @author Snap
	 * 
	 */	
	public class DeskShareFacade extends Facade implements IFacade
	{
		public static const NAME:String = "DeskShareFacade";
		public static const STARTUP:String = "startup";
		public static const STOP:String = "STOP";
		
		/**
		 * The constructor. Note that this class should not be instanciated this way. Use the getInstance() method instead
		 * 
		 */		
		public function DeskShareFacade()
		{
			super(NAME);
		}
		
		/**
		 * Returns the singleton object for this class
		 * @return 
		 * 
		 */		
		public static function getInstance():DeskShareFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new DeskShareFacade();
			return instanceMap[NAME] as DeskShareFacade;
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
			registerCommand(STOP, StopCommand);
		}
		
		/**
		 * Executes the StartupCommand 
		 * @param app
		 * 
		 */		
		public function startup(app:IBigBlueButtonModule):void{
			sendNotification(STARTUP, app);
		}
		
		/**
		 * Executes the StopCommand 
		 * @param app
		 * 
		 */		
		public function stop(app:IBigBlueButtonModule):void{
			sendNotification(STOP, app);
			removeCore(NAME);
		}

	}
}