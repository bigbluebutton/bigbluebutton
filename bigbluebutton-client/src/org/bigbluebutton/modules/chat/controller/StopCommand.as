package org.bigbluebutton.modules.chat.controller
{
	import org.bigbluebutton.modules.chat.ChatModuleConstants;
	import org.bigbluebutton.modules.chat.model.business.ChatProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StopCommand extends SimpleCommand implements ICommand
	{

		override public function execute(notification:INotification):void
		{
			if (facade.hasProxy(ChatProxy.NAME)) {
				var p:ChatProxy = facade.retrieveProxy(ChatProxy.NAME) as ChatProxy;
				p.stop();
				sendNotification(ChatModuleConstants.DISCONNECTED);
			}
		}		
	}
}