package org.bigbluebutton.modules.video.control
{
	import org.bigbluebutton.modules.video.model.ConnectionProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StopCommand extends SimpleCommand implements ICommand
	{
		override public function execute(notification:INotification):void
		{
			var p:ConnectionProxy = facade.retrieveProxy(ConnectionProxy.NAME) as ConnectionProxy;
			p.disconnect();
		}
	}
}