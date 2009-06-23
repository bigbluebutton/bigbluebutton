package org.bigbluebutton.modules.deskShare
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class DeskShareModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "DeskShareModuleMediator";
		private var _module:IBigBlueButtonModule;
		
		public function DeskShareModuleMediator(module:IBigBlueButtonModule)
		{
			_module = module;
		}

	}
}