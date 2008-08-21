package org.bigbluebutton.modules.sip.controller
{
	import org.bigbluebutton.modules.sip.SipModule;
	import org.bigbluebutton.modules.sip.SipModuleMediator;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StartupSipCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var app:SipModule = notification.getBody() as SipModule;
			
			facade.registerMediator(new SipModuleMediator(app));
		}

	}
}