package org.bigbluebutton.air.presentation {
	
	import org.bigbluebutton.air.presentation.views.PresentationViewMediator;
	import org.bigbluebutton.air.presentation.views.selectwebcam.ISelectStreamPopUp;
	import org.bigbluebutton.air.presentation.views.selectwebcam.SelectStreamPopUpMediator;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	import robotlegs.bender.framework.api.IInjector;
	
	public class PresentationConfig implements IConfig {
		
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
			mediatorMap.map(IPresentationView).toMediator(PresentationViewMediator);
			mediatorMap.map(ISelectStreamPopUp).toMediator(SelectStreamPopUpMediator);
		}
		
		/**
		 * Maps signals to commands using the signalCommandMap.
		 */
		private function signals():void {
		}
	}
}
