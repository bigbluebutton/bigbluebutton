package org.bigbluebutton.air.screenshare
{
	import org.bigbluebutton.air.screenshare.model.IScreenshareModel;
	import org.bigbluebutton.air.screenshare.model.ScreenshareModel;
	import org.bigbluebutton.air.screenshare.services.IScreenshareService;
	import org.bigbluebutton.air.screenshare.services.ScreenshareService;
	import org.bigbluebutton.air.screenshare.views.ScreenshareView;
	import org.bigbluebutton.air.screenshare.views.ScreenshareViewMediator;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;

	public class ScreenshareConfig implements IConfig
	{
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			injector.map(IScreenshareService).toSingleton(ScreenshareService);			
			injector.map(IScreenshareModel).toSingleton(ScreenshareModel);
			
			mediators();
			signals();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(ScreenshareView).toMediator(ScreenshareViewMediator);
		}
		
		private function signals():void {
		}
	}
}