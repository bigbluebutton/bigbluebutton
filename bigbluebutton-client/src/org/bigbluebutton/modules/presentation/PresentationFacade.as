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
package org.bigbluebutton.modules.presentation
{	
	import org.bigbluebutton.modules.presentation.controller.GotoSlideCommand;
	import org.bigbluebutton.modules.presentation.controller.StartupCommand;
	import org.bigbluebutton.modules.presentation.controller.StopCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	
	/**
	 * This is the main facade class of the Presentation module
	 * <p>
	 * This class extends the Facade class of the pureMVC framework 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class PresentationFacade extends Facade implements IFacade
	{
		public static const NAME : String = "PresentationFacade";

		public static const STARTUP:String = "startup";
		public static const STOP:String = "STOP";
				
		/**
		 * The default constructor. Should never be called directly as this class is a singleton, however
		 * ActionScript does not support provate constructors. 
		 * 
		 */		
		public function PresentationFacade() : void
		{
			super(NAME);		
		}

		/**
		 * Return the instance of PresentationFacade. Should be called whenever you need a PresentationFacade
		 * Always returns the same instance. 
		 * @return 
		 * 
		 */
		public static function getInstance() : PresentationFacade
		{
			if ( instanceMap[NAME] == null ) instanceMap[NAME] = new PresentationFacade();
				
			return instanceMap[NAME] as PresentationFacade;
	   	}	
	   	
	   	/**
	   	 * Initializes the controller part of this module 
	   	 * 
	   	 */	   	
	   	override protected function initializeController():void{
	   		super.initializeController();
	   		registerCommand(STARTUP, StartupCommand);
	   		registerCommand(STOP, StopCommand);
	   		registerCommand(PresentModuleConstants.GOTO_SLIDE, GotoSlideCommand);
	   	}	   	
	   	
	   	
	   	/**
	   	 * Sends out a notification to startup the Presentation module. Calls the StartupCommand 
	   	 * @param app
	   	 * 
	   	 */	   	
	   	public function startup(app:PresentationModule):void{
	 		  sendNotification(STARTUP, app);
	   	}
	   	
	   	public function stop(app:PresentationModule):void{
	 		  sendNotification(STOP, app);
	 		  removeCore(NAME);
	   	}
	}
}