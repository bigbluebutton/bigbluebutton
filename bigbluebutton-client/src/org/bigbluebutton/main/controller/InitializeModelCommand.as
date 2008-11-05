package org.bigbluebutton.main.controller
{
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class InitializeModelCommand extends SimpleCommand
	{
		override public function execute(note:INotification):void
		{
			var proxy:ModulesProxy = facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
			if (proxy != null) {
				trace('InitializeModelCommand: Found ModulesProxy');
				proxy.initialize();
			} else {
				trace('InitializeModelCommand: ModulesProxy does not exist.');
			}	
		}	
	}
}