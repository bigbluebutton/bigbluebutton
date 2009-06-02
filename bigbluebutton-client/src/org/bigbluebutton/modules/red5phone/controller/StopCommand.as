package org.bigbluebutton.modules.red5phone.controller
{
	import org.bigbluebutton.modules.red5phone.Red5PhoneModuleConstants;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class StopCommand extends SimpleCommand implements ICommand
	{

		override public function execute(notification:INotification):void
		{
			facade.sendNotification(Red5PhoneModuleConstants.DISCONNECTED);
		}		
	}
}