package org.bigbluebutton.air.presentation {
	
	import org.bigbluebutton.air.presentation.views.PresentationViewMediator;
	import org.bigbluebutton.air.presentation.views.selectwebcam.ISelectStreamPopUp;
	import org.bigbluebutton.air.presentation.views.selectwebcam.SelectStreamPopUpMediator;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class PresentationConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		public function configure():void {
			mediators();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IPresentationView).toMediator(PresentationViewMediator);
			mediatorMap.map(ISelectStreamPopUp).toMediator(SelectStreamPopUpMediator);
		}
	
	}
}
