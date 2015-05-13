package org.bigbluebutton.air.main.views {
	
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.air.main.models.IUserUISession;
	
	import robotlegs.bender.bundles.mvcs.Mediator;
	
	public class LoadingScreenMediator extends Mediator {
		
		[Inject]
		public var userUISettings:IUserUISession;
		
		[Inject]
		public var view:ILoadingScreen;
		
		/**
		 * Initialize listeners and Mediator initial state
		 */
		override public function initialize():void {
			view.setVisible(false);
			view.includeInLayout = false;
			update(userUISettings.loading);
			userUISettings.loadingSignal.add(update);
		}
		
		/**
		 * Destroy view and listeners
		 */
		override public function destroy():void {
			super.destroy();
			//view.dispose();
			view = null;
			userUISettings.loadingSignal.remove(update);
		}
		
		/**
		 * Update the view when there is a chenge in the model
		 */
		private function update(loading:Boolean):void {
			if (loading) {
				view.setVisible(true);
				view.includeInLayout = true;
			} else {
				view.setVisible(false);
				view.includeInLayout = false;
				FlexGlobals.topLevelApplication.mainshell.visible = true;
			}
		}
	}
}
