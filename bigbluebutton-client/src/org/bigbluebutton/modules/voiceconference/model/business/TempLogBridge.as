package org.bigbluebutton.modules.voiceconference.model.business
{
	import org.bigbluebutton.modules.log.LogModuleFacade;
	
	public class TempLogBridge
	{
		private var log:LogModuleFacade;
		
		public function TempLogBridge()
		{
			log = LogModuleFacade.getInstance("LogModule");
		}
		
		public function debug(message:String):void{
			log.debug(message);
		}
		
		public function info(message:String):void{
			log.info(message);	
		}
		
		public function error(message:String):void{
			log.error(message);	
		}

	}
}