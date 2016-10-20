package org.bigbluebutton.air.presentation {
	
	import org.bigbluebutton.air.presentation.views.PresentationViewMediator;
	import org.bigbluebutton.air.presentation.views.selectwebcam.ISelectStreamPopUp;
	import org.bigbluebutton.air.presentation.views.selectwebcam.SelectStreamPopUpMediator;
	import org.bigbluebutton.lib.main.commands.GoToSlideCommand;
	import org.bigbluebutton.lib.main.commands.GoToSlideSignal;
	import org.bigbluebutton.lib.presentation.views.IPresentationView;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class PresentationConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
			signals();
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
			signalCommandMap.map(GoToSlideSignal).toCommand(GoToSlideCommand);
		}
	
	}
}
