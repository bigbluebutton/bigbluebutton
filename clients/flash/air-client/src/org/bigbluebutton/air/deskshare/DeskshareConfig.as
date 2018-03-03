package org.bigbluebutton.air.deskshare {
	
	import org.bigbluebutton.air.deskshare.views.DeskshareViewMediator;
	import org.bigbluebutton.air.deskshare.views.IDeskshareView;
	
	import robotlegs.bender.extensions.mediatorMap.api.IMediatorMap;
	import robotlegs.bender.extensions.signalCommandMap.api.ISignalCommandMap;
	import robotlegs.bender.framework.api.IConfig;
	
	public class DeskshareConfig implements IConfig {
		
		[Inject]
		public var mediatorMap:IMediatorMap;
		
		[Inject]
		public var signalCommandMap:ISignalCommandMap;
		
		public function configure():void {
			mediators();
		}
		
		/**
		 * Maps view mediators to views.
		 */
		private function mediators():void {
			mediatorMap.map(IDeskshareView).toMediator(DeskshareViewMediator);
		}
	
	}
}
