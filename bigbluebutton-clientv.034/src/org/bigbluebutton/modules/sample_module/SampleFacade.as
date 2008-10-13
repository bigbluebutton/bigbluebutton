package org.bigbluebutton.modules.sample_module
{
	import org.bigbluebutton.modules.sample_module.controller.StartupSampleCommand;
	import org.puremvc.as3.multicore.patterns.facade.Facade;
	
	/**
	 * This is the facade for the Module 
	 * @author Denis
	 * 
	 */	
	public class SampleFacade extends Facade
	{
		public static const NAME:String = "SampleFacade";
		public static const STARTUP:String = "StartupSampleModule";
		
		//Notification Constants
		public static const TEST:String = "Test";
		
		public function SampleFacade()
		{
			super(NAME);
		}
		
		/**
		 *  
		 * @return - the Unique! instance of this Singleton facade.
		 * 
		 */		
		public static function getInstance():SampleFacade{
			if (instanceMap[NAME] == null) instanceMap[NAME] = new SampleFacade;
			return instanceMap[NAME] as SampleFacade;
		}
		
		override protected function initializeController():void{
			super.initializeController();
			registerCommand(STARTUP, StartupSampleCommand);
		}
		
		/**
		 * Sends out a command to start the rest of the module (mediators, proxies) 
		 * @param app
		 * 
		 */		
		public function startup(app:SampleModule):void{
			sendNotification(STARTUP, app);
		}

	}
}