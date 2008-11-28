package org.bigbluebutton.modules.presentation.controller
{
	import org.bigbluebutton.modules.presentation.model.business.PresentProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StopCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			if (facade.hasProxy(PresentProxy.NAME)) {
				var p:PresentProxy = facade.retrieveProxy(PresentProxy.NAME) as PresentProxy;
				if (p.isPresenter()) p.clearPresentation();
				p.stop();
			} else {
				LogUtil.debug('Present Proxy not found.');
			}
			
			
		}
	}
}