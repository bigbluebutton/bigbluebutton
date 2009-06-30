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
package org.bigbluebutton.modules.whiteboard
{
	
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.whiteboard.controller.StartupCommand;
	import org.bigbluebutton.modules.whiteboard.controller.StopCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * The BoardFacade class is an implementation of the Facade pattern for the Whiteboard application.
	 * The Facade pattern delegates requests to the Model, View, Controller so that we don't have to interact
	 * with those classes directly
	 * <p>
	 * The BoardFacade class extends the Facade class of the PureMVC framework
	 * <p>
	 * The BoardFacade is also a Singleton - It cannot be instantiated more than once
	 * @author dzgonjan
	 * 
	 */	
	public class BoardFacade extends Facade implements IFacade
	{
		public static const NAME:String = "BoardFacade";
		public static const STARTUP:String = "startup";
		public static const UPDATE:String = "update";
		public static const FAILED_CONNECTION:String = "conn_failed";
		public static const CLEAR_BOARD:String = "clear";
		public static const UNDO_SHAPE:String = "undoShape";
		public static const STOP:String = "STOP";
		
		public function BoardFacade(){
			super(NAME);
		}
		
		/**
		 * Returns the BoardFacade instance. This method always returns the same instance of this class
		 * @return the instance of BoardFacade
		 * 
		 */		
		public static function getInstance():BoardFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new BoardFacade();
			return instanceMap[NAME] as BoardFacade;
		}
		
		/**
		 * Initializes the controller part of the application through the PureMVC framework.
		 * This functionality is abstracted inside of PureMVC
		 * <p>
		 * The BoardFacade listens to the STARTUP event. Once a STARTUP event is generated, the BoardFacade
		 * creates a new StartupCommand object to initialize the rest of the application.
		 * 
		 */		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
			registerCommand(STOP,StopCommand);
		}
		
		/**
		 * The startup method is called from the Whiteboard.mxml component upon creationComplete().
		 * This method sends out a STARTUP notification.
		 * @param app
		 * 
		 */		
		public function startup(app:WhiteboardModule):void{
			sendNotification(BoardFacade.STARTUP, app);
		}
		
		/**
		 * Stops this module 
		 * @param app
		 * 
		 */		
		public function stop(app:IBigBlueButtonModule):void {
			sendNotification(STOP, app);
			removeCore(NAME);
		}	

	}
}