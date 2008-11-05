package org.bigbluebutton.main.controller
{
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	import org.bigbluebutton.main.model.ModulesProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	
	public class StartModuleCommand extends SimpleCommand
	{
		override public function execute(note:INotification):void
		{
			var proxy:ModulesProxy = facade.retrieveProxy(ModulesProxy.NAME) as ModulesProxy;
			if (proxy != null) {
				trace('Found ModulesProxy');
				proxy.loadModules();
			} else {
				trace('ModulesProxy does not exist.');
			}		
		}	
	}
}