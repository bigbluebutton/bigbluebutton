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
package org.bigbluebutton.modules.log
{
	import org.bigbluebutton.modules.log.controller.ClearCommand;
	import org.bigbluebutton.modules.log.controller.SetLevelCommand;
	import org.bigbluebutton.modules.log.controller.StartupCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	public class LogModuleFacade extends Facade implements IFacade
	{
		public static const STARTUP:String        = 'STARTUP';
		public static const SET_LEVEL:String	  = 'SET_LEVEL'; 
		public static const CLEAR:String   		  = 'CLEAR';
		public static const DEBUG:String          = 'DEBUG';
		public static const WARNING:String        = 'WARNING';
		public static const ERROR:String          = 'ERROR';
		public static const INFO:String           = 'INFO';
		public static const CHAT:String           = 'CHAT';
		public static const PRESENTATION:String   = 'PRESENTATION';
		public static const VOICE:String          = 'VOICE';
		public static const VIDEO:String          = 'VIDEO';
		public static const VIEWER:String         = 'VIEWER';
				
		public function LogModuleFacade( key:String )
		{
			super(key);	
		}

        /**
         * Singleton ApplicationFacade Factory Method
         */
        public static function getInstance( key:String ) : LogModuleFacade 
        {
            if ( instanceMap[ key ] == null ) instanceMap[ key ]  = new LogModuleFacade( key );
            return instanceMap[ key ] as LogModuleFacade;
        }
        
	    /**
         * Register Commands with the Controller 
         */
        override protected function initializeController( ) : void 
        {
            super.initializeController();            
            registerCommand( STARTUP, StartupCommand );
            registerCommand( SET_LEVEL, SetLevelCommand );
            registerCommand( CLEAR, ClearCommand );
        }
        
        /**
         * Application startup
         * 
         * @param app a reference to the application component 
         */  
        public function startup( app:LogModule ):void
        {
        	sendNotification( STARTUP, app );
        }
        
        
        /**
         * sends debug notification 
         * @param message
         * 
         */        
        public function debug(message:String):void
        {
        	sendNotification(DEBUG , message);
        }
        /**
         * sends warning notification 
         * @param message
         * 
         */        
        public function warning(message:String):void
        {
        	sendNotification(WARNING , message);
        }
        /**
         * sends info notification 
         * @param message
         * 
         */        
        public function info(message:String):void
        {
        	sendNotification(INFO , message);
        }
        /**
         * sends error notification 
         * @param message
         * 
         */        
        public function error(message:String):void
        {
        	sendNotification(ERROR , message);
        }
        
        public function chat(message:String):void {sendNotification (CHAT , message);}
        public function presentation(message:String):void {sendNotification (PRESENTATION , message);}
        public function voice(message:String):void {sendNotification (VOICE , message);}
        public function viewer(message:String):void {sendNotification (VIEWER , message);}
        public function video(message:String):void {sendNotification (VIDEO , message);}
        
        
		
	}
}