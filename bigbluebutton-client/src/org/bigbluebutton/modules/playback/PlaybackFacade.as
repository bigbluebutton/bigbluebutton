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
package org.bigbluebutton.modules.playback
{
	import org.bigbluebutton.modules.playback.controller.LoadXMLCommand;
	import org.bigbluebutton.modules.playback.controller.ParseCompleteCommand;
	import org.bigbluebutton.modules.playback.controller.StartPlaybackCommand;
	import org.bigbluebutton.modules.playback.controller.StartRecordingCommand;
	import org.bigbluebutton.modules.playback.controller.StartupPlaybackCommand;
	import org.bigbluebutton.modules.playback.view.PlaybackWindow;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	public class PlaybackFacade extends Facade  
	{
		public static const NAME:String = "PlaybackFacade";
		
		//Notification Constants
		public static const STARTUP:String = "StartPlaybackModule";
		public static const LOAD_XML:String = "Load XML";
		public static const XML_READY:String = "XML file loaded";
		public static const PARSE_COMPLETE:String = "Parsing Complete";
		
		public static const PLAY:String = "Play";
		public static const STOP:String = "Stop";
		public static const SEND_OUT_MESSAGE:String = "Send Outbound Message";
		
		public static const TEST:String = "Test";
		
		public function PlaybackFacade(key:String)
		{
			super(key);
		}
		
		public static function getInstance():PlaybackFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new PlaybackFacade(NAME);
			return instanceMap[NAME] as PlaybackFacade;
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupPlaybackCommand);
			registerCommand(LOAD_XML, LoadXMLCommand);
			registerCommand(XML_READY, StartPlaybackCommand);  
			registerCommand(PARSE_COMPLETE, ParseCompleteCommand);
			registerCommand(PlaybackWindow.START_RECORDING, StartRecordingCommand);
		}
		
		public function startup(app:PlaybackModule):void{
			sendNotification(STARTUP, app);
		}

	}
}