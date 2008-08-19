package org.bigbluebutton.modules.playback
{
	import org.bigbluebutton.modules.playback.controller.LoadXMLCommand;
	import org.bigbluebutton.modules.playback.controller.ParseCompleteCommand;
	import org.bigbluebutton.modules.playback.controller.StartPlaybackCommand;
	import org.bigbluebutton.modules.playback.controller.StartupPlaybackCommand;
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
		}
		
		public function startup(app:PlaybackModule):void{
			sendNotification(STARTUP, app);
		}

	}
}