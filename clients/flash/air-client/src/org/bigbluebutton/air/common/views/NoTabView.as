package org.bigbluebutton.air.common.views {
	
	import spark.components.View;
	
	[Style(name = "toolbarHeight", inherit = "yes", type = "Number")]
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
