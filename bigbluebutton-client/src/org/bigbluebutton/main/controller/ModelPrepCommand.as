package org.bigbluebutton.main.controller
{
	import org.puremvc.as3.multicore.interfaces.ICommand;
	import org.puremvc.as3.multicore.patterns.command.SimpleCommand;

	public class ModelPrepCommand extends SimpleCommand implements ICommand
	{
		public function ModelPrepCommand()
		{
			super();
		}
		
	}
}