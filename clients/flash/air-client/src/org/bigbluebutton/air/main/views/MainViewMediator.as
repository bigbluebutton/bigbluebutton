package org.bigbluebutton.air.main.views {
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class MainViewMediator extends Mediator {
		
		[Inject]
		public var view:MainView;
		
		
		override public function initialize():void {
			trace("************ MainViewMediator:: INIT **************");
		}
		
		override public function destroy():void {
			trace("************ MainViewMediator:: destroy **************");
		}
	}
}
