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
		// Notification constants 
		public static const STARTUP:String = 'startup';
		public static const ADD_WINDOW1:String = 'addWindow';
		public static const REMOVE_WINDOW1:String = 'removeWindow';
		public static const OPEN_CAMERA:String = "open_camera_window";
				
		public function MainApplicationFacade(key:String)
		{
			super(key);
		}
		
        /**
         * Singleton ApplicationFacade Factory Method
         */
        public static function getInstance( key:String ) : MainApplicationFacade 
        {
            if ( instanceMap[ key ] == null ) instanceMap[ key ] = new MainApplicationFacade( key );
            return instanceMap[ key ] as MainApplicationFacade;
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
        	sendNotification( STARTUP, app );
        }	
        
        public function openViewCamera(streamName:String):void{
        	sendNotification(OPEN_CAMERA, streamName);
        }	
	}
}