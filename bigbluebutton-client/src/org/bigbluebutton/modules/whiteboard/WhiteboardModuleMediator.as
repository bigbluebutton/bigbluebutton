package org.bigbluebutton.modules.whiteboard
{
	import org.bigbluebutton.common.IBigBlueButtonModule;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class WhiteboardModuleMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "WhiteboardModuleMediator";
		
		private var _module:IBigBlueButtonModule;
		
		public function WhiteboardModuleMediator(module:IBigBlueButtonModule)
		{
			super(NAME, module);
			_module = module;	
		}

	}
}