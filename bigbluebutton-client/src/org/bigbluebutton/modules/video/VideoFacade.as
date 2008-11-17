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
package org.bigbluebutton.modules.video
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.bigbluebutton.modules.video.control.StartupVideoCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * 
	 * @author Denis Zgonjanin
	 * 
	 */	
	public class VideoFacade extends Facade implements IFacade
	{
		public static const NAME:String = "VideoFacade";
		
		public static const STARTUP:String = "StartupVideo";
		
		/**
		 * The constructor. Should never be called, however ActionScript does not support private
		 * constructors. Use the getInstance() method instead. 
		 * 
		 */		
		public function VideoFacade(name:String)
		{
			super(name);
		}
		
		/**
		 * The getInstance() method of this singleton 
		 * @return 
		 * 
		 */		
		public static function getInstance(name:String):VideoFacade{
			if (instanceMap[name] == null) instanceMap[name] = new VideoFacade(name);
			return instanceMap[name] as VideoFacade;
		}
		
		/**
		 * Maps notifications to command execution 
		 * 
		 */		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupVideoCommand);
		}
		
		/**
		 * Starts up the model of this application 
		 * @param app
		 * 
		 */		
		public function startup(app:IBigBlueButtonModule):void{
			sendNotification(STARTUP, app);
		}

	}
}