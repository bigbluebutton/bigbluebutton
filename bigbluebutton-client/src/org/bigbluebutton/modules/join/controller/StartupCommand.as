package org.bigbluebutton.modules.join.controller
{
	import org.bigbluebutton.modules.join.JoinEndpointMediator;
	import org.bigbluebutton.modules.join.JoinModuleConstants;
	import org.bigbluebutton.modules.join.JoinModuleMediator;
	import org.bigbluebutton.modules.join.model.JoinProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StartupCommand extends SimpleCommand
	{
		public function StartupCommand()
		{
			super();
		}
	
		override public function execute(note:INotification):void {
			var m:JoinModule = note.getBody() as JoinModule;
			
			LogUtil.debug('facade.registerMediator(new JoinEndpointMediator(m));');
			facade.registerMediator(new JoinEndpointMediator(m));
			LogUtil.debug('facade.registerMediator(new JoinModuleMediator(m));');
			facade.registerMediator(new JoinModuleMediator(m));
//			LogUtil.debug('facade.registerMediator( new JoinWindowMediator(m) );');
//			facade.registerMediator( new JoinWindowMediator(m) );
			LogUtil.debug('facade.registerProxy(new JoinProxy(m.uri));');
			facade.registerProxy(new JoinProxy(m.uri));
			LogUtil.debug('JoinModule COnnected');
			facade.sendNotification(JoinModuleConstants.STARTED);
			proxy.join();
		}
		
		private function get proxy():JoinProxy {
			return facade.retrieveProxy(JoinProxy.NAME) as JoinProxy;
		}
	}
}