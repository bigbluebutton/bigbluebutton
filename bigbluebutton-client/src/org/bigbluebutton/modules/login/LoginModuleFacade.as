package org.bigbluebutton.modules.login
{
	import org.bigbluebutton.modules.login.controller.StartupCommand;
	import org.puremvc.as3.multicore.interfaces.IFacade;
	import org.puremvc.as3.multicore.patterns.facade.Facade;

	public class LoginModuleFacade extends Facade implements IFacade
	{
		public static const NAME:String = "LoginModuleFacade";
		
		public static const STARTUP:String = 'startup';
		public static const LOGIN:String = 'login';
		public static const LOGOUT:String = 'login';
		
		public function LoginModuleFacade(key:String)
		{
			//TODO: implement function
			super(key);
		}

		public static function getInstance():LoginModuleFacade{
			if (instanceMap[NAME] == null) 
				instanceMap[NAME] = new LoginModuleFacade(NAME);
			return instanceMap[NAME] as LoginModuleFacade;
		}
		
		override protected function initializeController():void {
			super.initializeController();
			registerCommand(STARTUP, StartupCommand);
//			registerCommand(LOGIN, LoginCommand);
//			registerCommand(LOGOUT, LogoutCommand);
		}
		
		public function startup(module:LoginModule):void {
			sendNotification(STARTUP, module);
		}
	}
}