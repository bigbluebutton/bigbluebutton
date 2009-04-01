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
package org.bigbluebutton.main
{
	import org.bigbluebutton.main.controller.StartupCommand;
	import org.bigbluebutton.main.view.components.MainApplicationShell;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * 
	 * Facade for the Shell
	 * 
	 */	
	public class MainApplicationFacade extends Facade implements IFacade
	{
		public static const NAME:String = "MainApplicationFacade";
		
		public static const STARTUP:String = 'startup';
		
		public function MainApplicationFacade(key:String)
		{
			super(key);
		}
		
        /**
         * Singleton ApplicationFacade Factory Method
         */
        public static function getInstance() : MainApplicationFacade 
        {
            if ( instanceMap[ NAME ] == null ) instanceMap[ NAME ] = new MainApplicationFacade( NAME );
            return instanceMap[ NAME ] as MainApplicationFacade;
        }
        
	    /**
         * Register Commands with the Controller 
         */
        override protected function initializeController( ) : void 
        {
            super.initializeController();            
            registerCommand( STARTUP, StartupCommand );
        }
        
        /**
         * Application startup
         * 
         * @param app a reference to the application component 
         */  
        public function startup( app:MainApplicationShell ):void
        {
        	LogUtil.debug("Main Facade is starting up.");
        	sendNotification( STARTUP, app );
        }	
	}
}