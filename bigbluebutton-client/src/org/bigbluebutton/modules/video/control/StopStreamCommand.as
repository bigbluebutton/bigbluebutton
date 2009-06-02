package org.bigbluebutton.modules.video.control
{
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;
	import org.puremvc.as3.multicore.interfaces.INotification;

	public class StopStreamCommand extends SimpleCommand implements ICommand
	{
		public function StopStreamCommand()
		{
			super();
		}
		
		override public function execute(notification:INotification):void
		{
		}	
	}
}