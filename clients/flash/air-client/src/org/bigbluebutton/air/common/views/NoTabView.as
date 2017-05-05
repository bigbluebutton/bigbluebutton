package org.bigbluebutton.air.common.views {
	
	import spark.components.View;
	
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
	[Style(name = "toolbarHeight", inherit = "yes", type = "Number")]
	public class NoTabView extends View {
		
		protected var _topToolbar:TopToolbarAIR;
		
		public function NoTabView() {
			super();
			actionBarVisible = false;
			createToolbar();
			_topToolbar = createToolbar();
			_topToolbar.percentWidth = 100;
			addElement(_topToolbar);
		}
		
		/**
		 * Override this method in subclasses to be notified of rotation changes
		 */
		public function rotationHandler(rotation:String):void {
		}
		
		protected function createToolbar():TopToolbarAIR {
			return new TopToolbarAIR();
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_topToolbar.height = getStyle("toolbarHeight");
		}
	}
}
