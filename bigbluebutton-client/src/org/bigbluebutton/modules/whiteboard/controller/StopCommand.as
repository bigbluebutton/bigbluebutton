package org.bigbluebutton.modules.whiteboard.controller
{
	import org.bigbluebutton.modules.whiteboard.model.DrawProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class StopCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			if (facade.hasProxy(DrawProxy.NAME)){
				var p:DrawProxy = facade.retrieveProxy(DrawProxy.NAME) as DrawProxy;
				p.stop();
			}
		}

	}
}