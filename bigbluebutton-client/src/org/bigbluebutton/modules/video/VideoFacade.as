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
		public static const CLOSE_RECORDING:String = "Close MyCameraWindow";
		public static const CLOSE_ALL:String = "Close Video Module";
		
		public static const ENABLE_CAMERA:String = "Enable Camera";
		
		public static const STARTUP:String = "StartupVideo";
		public static const SETUP_DEVICES_COMMAND : String = 			"PUBLISHER_SETUP_DEVICES_COMMAND";		
		
		public static const ENABLE_AUDIO_COMMAND : String = 			"PUBLISHER_ENABLE_AUDIO_COMMAND";
		public static const ENABLE_VIDEO_COMMAND : String = 			"PUBLISHER_ENABLE_VIDEO_COMMAND";
			
		public static const START_CAMERA_COMMAND : String = 			"PUBLISHER_START_CAMERA_COMMAND";
		public static const STOP_CAMERA_COMMAND : String = 				"PUBLISHER_STOP_CAMERA_COMMAND";	
			
		public static const START_MICROPHONE_COMMAND : String = 		"PUBLISHER_START_MICROPHONE_COMMAND";
		public static const STOP_MICROPHONE_COMMAND : String = 			"PUBLISHER_STOP_MICROPHONE_COMMAND";		
	
		public static const START_CONNECTION_COMMAND : String = 		"PUBLISHER_START_CONNECTION_COMMAND";
		public static const CLOSE_CONNECTION_COMMAND : String = 		"PUBLISHER_CLOSE_CONNECTION_COMMAND";
		public static const SETUP_CONNECTION_COMMAND : String = 		"PUBLISHER_SETUP_CONNECTION_COMMAND";	
			
		public static const SETUP_STREAMS_COMMAND : String = 			"PUBLISHER_SETUP_STREAMS_COMMAND";
		public static const STOP_STREAM_COMMAND : String = 				"PUBLISHER_STOP_STREAM_COMMAND";
		public static const PLAY_STREAM_COMMAND : String = 				"PUBLISHER_PLAY_STREAM_COMMAND";
		public static const PAUSE_STREAM_COMMAND : String = 			"PUBLISHER_PAUSE_STREAM_COMMAND";
		public static const RESUME_STREAM_COMMAND : String = 			"PUBLISHER_RESUME_STREAM_COMMAND";
		public static const PUBLISH_STREAM_COMMAND : String = 			"PUBLISHER_PUBLISH_STREAM_COMMAND";
		public static const UNPUBLISH_STREAM_COMMAND : String = 		"PUBLISHER_UNPUBLISH_STREAM_COMMAND";
		
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
		public function startup(app:VideoModule):void{
			sendNotification(STARTUP, app);
		}

	}
}