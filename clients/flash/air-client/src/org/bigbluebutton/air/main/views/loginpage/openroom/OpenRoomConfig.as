package org.bigbluebutton.air.main.views.loginpage.openroom {
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class OpenRoomConfig implements IConfig {
		
		[Inject]
		public var injector:IInjector;
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			dependencies();
			mediators();
			signals();
		}
		
		/**
		 * Specifies all the dependencies for the feature
		 * that will be injected onto objects used by the
		 * application.
		 */
		private function dependencies():void {
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IOpenRoomView).toMediator(OpenRoomViewMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
		}
	}
}
