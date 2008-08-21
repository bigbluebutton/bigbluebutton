package org.bigbluebutton.modules.sip
{
	import org.bigbluebutton.modules.sip.controller.StartupSipCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	public class SipModuleFacade extends Facade implements IFacade
	{
		public static const NAME:String = "SipModuleFacade";
		
		//Notification Constants
		public static const STARTUP:String = "Startup Sip Module";
		
		public function SipModuleFacade(key:String)
		{
			super(key);
		}
		
		public static function getInstance():SipModuleFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new SipModuleFacade(NAME);
			return instanceMap[NAME] as SipModuleFacade;
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupSipCommand);
		}
		
		public function startup(app:SipModule):void{
			sendNotification(STARTUP, app);
		}

	}
}