package org.bigbluebutton.air.common.views {
	
	import spark.components.View;
	
	public class NoTabView extends View {
		public function NoTabView() {
			super();
			actionBarVisible = false;
		}
		
		/**
		 * Override this method in subclasses to be notified of rotation changes
		 */
		public function rotationHandler(rotation:String):void {
		}
	}
}
