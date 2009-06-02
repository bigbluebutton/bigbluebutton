package org.bigbluebutton.modules.login.controller
{
	import org.bigbluebutton.modules.login.LoginEndpointMediator;
	import org.bigbluebutton.modules.login.LoginModuleConstants;
	import org.bigbluebutton.modules.login.LoginModuleMediator;
	import org.bigbluebutton.modules.login.model.LoginProxy;
	import org.bigbluebutton.modules.login.view.LoginWindowMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand
	{
		public function StartupCommand()
		{
			super();
		}
	
		override public function execute(note:INotification):void {
			var m:LoginModule = note.getBody() as LoginModule;
			
			LogUtil.debug('facade.registerMediator(new LoginEndpointMediator(m));');
			facade.registerMediator(new LoginEndpointMediator(m));
			LogUtil.debug('facade.registerMediator(new LoginModuleMediator(m));');
			facade.registerMediator(new LoginModuleMediator(m));
			LogUtil.debug('facade.registerMediator( new LoginWindowMediator(m) );');
			facade.registerMediator( new LoginWindowMediator(m) );
			LogUtil.debug('facade.registerProxy(new LoginProxy(m.uri));');
			facade.registerProxy(new LoginProxy(m.uri));
			LogUtil.debug('LoginModule COnnected');
			facade.sendNotification(LoginModuleConstants.STARTED);
		}
	}
}