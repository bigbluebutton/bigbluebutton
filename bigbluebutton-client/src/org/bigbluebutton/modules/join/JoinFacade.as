package org.bigbluebutton.modules.join
{
	import org.bigbluebutton.modules.join.controller.StartupCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	public class JoinFacade extends Facade implements IFacade
	{
		public static const NAME:String = "JoinFacade";
		
		public static const STARTUP:String = 'startup';
		public static const STOP:String = 'stop';
		public static const LOGIN:String = 'login';
		public static const LOGOUT:String = 'login';
		
		public function JoinFacade(key:String)
		{
			//TODO: implement function
			super(key);
		}

		public static function getInstance():JoinFacade{
			if (instanceMap[NAME] == null) 
				instanceMap[NAME] = new JoinFacade(NAME);
			return instanceMap[NAME] as JoinFacade;
		}
		
		override protected function initializeController():void {
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
		}
		
		public function startup(module:JoinModule):void {
			LogUtil.debug('JoinFacade startup');
			sendNotification(STARTUP, module);
		}
		
		public function stop(app:JoinModule):void{
	 		  sendNotification(STOP, app);
	 		  removeCore(NAME);
	   	}
	}
}