package org.bigbluebutton.modules.video.control
{
	import org.bigbluebutton.modules.video.model.MediaProxy;
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.interfaces.INotification;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class SetupCommand extends SimpleCommand implements ICommand
	{
		public function SetupCommand()
		{
			super();
		}
		
		override public function execute(notification:INotification):void
		{
			var mp:MediaProxy = new MediaProxy();
			facade.registerProxy(mp);
			mp.setup();			
		}		
	}
}