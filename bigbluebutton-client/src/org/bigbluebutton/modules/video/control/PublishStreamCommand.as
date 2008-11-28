package org.bigbluebutton.modules.video.control
{
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class PublishStreamCommand extends SimpleCommand implements ICommand
	{
		public function PublishStreamCommand()
		{
			super();
		}
		
		override public function execute(notification:INotification):void
		{
			if (facade.hasProxy(MediaProxy.NAME)) {
				var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
				LogUtil.debug('Start broadcasting ' + notification.getBody().mode + " " + notification.getBody().stream);
				p.startBroadcasting(notification.getBody().mode, notification.getBody().stream);
			}
		}		
	}
}