package org.bigbluebutton.modules.login.controller
{
	import org.bigbluebutton.modules.login.LoginModuleMediator;
	import org.bigbluebutton.modules.login.model.LoginProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand
	{
		public function StartupCommand()
		{
			super();
		}
	
		override public function execute(note:INotification):void {
			facade.registerProxy(new LoginProxy());
			facade.registerMediator(new LoginModuleMediator());
		}
	}
}