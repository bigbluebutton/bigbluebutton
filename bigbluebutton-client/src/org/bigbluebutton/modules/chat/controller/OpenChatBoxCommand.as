package org.bigbluebutton.modules.chat.controller
{
	import org.bigbluebutton.modules.chat.view.ChatBoxMediator;
	import org.bigbluebutton.modules.chat.view.components.ChatBox;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class OpenChatBoxCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			var box:ChatBox = notification.getBody() as ChatBox;
			
			facade.registerMediator(new ChatBoxMediator(box));
		}

	}
}