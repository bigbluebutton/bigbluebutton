package org.bigbluebutton.modules.deskShare.controller
{
	import org.bigbluebutton.modules.deskShare.model.business.DeskShareProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	/**
	 * This command is executed when the module stops. It's purpose is to shut down the module gracefully and release all the resources 
	 * @author Snap
	 * 
	 */	
	public class StopCommand extends SimpleCommand implements ICommand
	{
		override public function execute(notification:INotification):void{
			if (facade.hasProxy(DeskShareProxy.NAME)){
				var proxy:DeskShareProxy = facade.retrieveProxy(DeskShareProxy.NAME) as DeskShareProxy;
				proxy.stop();
			}
		}

	}
}