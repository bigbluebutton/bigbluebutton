package org.bigbluebutton.modules.video.control
{
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class CreateBroadcastStreamCommand extends SimpleCommand implements ICommand
	{
		override public function execute(notification:INotification):void
		{
			if (facade.hasProxy(MediaProxy.NAME)) {
				var p:MediaProxy = facade.retrieveProxy(MediaProxy.NAME) as MediaProxy;
				trace('creating broadcastmedia ' + notification.getBody() as String);
				p.createBroadcastMedia(notification.getBody() as String);
			} else {
				trace('MediaProxy not found.');
			}
		}
		
	}
}