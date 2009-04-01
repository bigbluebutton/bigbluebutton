package org.bigbluebutton.modules.login
{
	import org.bigbluebutton.modules.login.controller.StartupCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	public class LoginFacade extends Facade implements IFacade
	{
		public static const NAME:String = "LoginFacade";
		
		public static const STARTUP:String = 'startup';
		public static const STOP:String = 'stop';
		public static const LOGIN:String = 'login';
		public static const LOGOUT:String = 'login';
		
		public function LoginFacade(key:String)
		{
			//TODO: implement function
			super(key);
		}

		public static function getInstance():LoginFacade{
			if (instanceMap[NAME] == null) 
				instanceMap[NAME] = new LoginFacade(NAME);
			return instanceMap[NAME] as LoginFacade;
		}
		
		override protected function initializeController():void {
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
		}
		
		public function startup(module:LoginModule):void {
			LogUtil.debug('LoginFacade startup');
			sendNotification(STARTUP, module);
		}
		
		public function stop(app:LoginModule):void{
	 		  sendNotification(STOP, app);
	 		  removeCore(NAME);
	   	}
	}
}