package org.bigbluebutton.modules.playback.controller
{
	import org.bigbluebutton.modules.playback.model.XMLProxy;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	
	public class LoadXMLCommand extends SimpleCommand
	{
		override public function execute(notification:INotification):void{
			facade.registerProxy(new XMLProxy(XMLProxy.path));
		}

	}
}