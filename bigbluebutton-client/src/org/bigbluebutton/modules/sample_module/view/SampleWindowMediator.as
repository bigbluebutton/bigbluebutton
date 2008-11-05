package org.bigbluebutton.modules.sample_module.view
{
	import flash.events.Event;
	
	import org.bigbluebutton.modules.sample_module.model.SampleProxy;
	import org.puremvc.as3.multicore.interfaces.IMediator;
	import org.puremvc.as3.multicore.patterns.mediator.Mediator;
	
	public class SampleWindowMediator extends Mediator implements IMediator
	{
		public static const NAME:String = "SampleWindowMediator";
		public static const TEST:String = "Test Event";
		
		public function SampleWindowMediator(viewComponent:SampleWindow)
		{
			super(NAME, viewComponent);
			viewComponent.addEventListener(TEST, test);
		}
		
		override public function initializeNotifier(key:String):void{
			super.initializeNotifier(key);
		}
		
		private function get proxy():SampleProxy{
			return facade.retrieveProxy(SampleProxy.NAME) as SampleProxy;
		}
		
		public function test(e:Event):void{
			proxy.test();
		}

	}
}