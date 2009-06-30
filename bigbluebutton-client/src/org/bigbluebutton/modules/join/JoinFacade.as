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
package org.bigbluebutton.modules.join
{
	import org.bigbluebutton.modules.join.controller.StartupCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	public class JoinFacade extends Facade implements IFacade
	{
		public static const NAME:String = "JoinFacade";
		
		public static const STARTUP:String = 'startup';
		public static const STOP:String = 'stop';
		public static const LOGIN:String = 'login';
		public static const LOGOUT:String = 'login';
		
		public function JoinFacade(key:String)
		{
			//TODO: implement function
			super(key);
		}

		public static function getInstance():JoinFacade{
			if (instanceMap[NAME] == null) 
				instanceMap[NAME] = new JoinFacade(NAME);
			return instanceMap[NAME] as JoinFacade;
		}
		
		override protected function initializeController():void {
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
		}
		
		public function startup(module:JoinModule):void {
			LogUtil.debug('JoinFacade startup');
			sendNotification(STARTUP, module);
		}
		
		public function stop(app:JoinModule):void{
	 		  sendNotification(STOP, app);
	 		  removeCore(NAME);
	   	}
	}
}