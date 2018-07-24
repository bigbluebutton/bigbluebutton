package org.bigbluebutton.air.common.views {
	
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.ui.Keyboard;
	
	import spark.components.View;
	
	import org.bigbluebutton.air.main.views.TopToolbarBase;
	
	[Style(name = "toolbarHeight", inherit = "yes", type = "Number")]
	public class NoTabView extends View {
		
		protected var _topToolbar:TopToolbarBase;
		
		public function NoTabView() {
			super();
			actionBarVisible = false;
			createToolbar();
			_topToolbar = createToolbar();
			_topToolbar.percentWidth = 100;
			addElement(_topToolbar);
		}
		
		public function triggerLeftMenuTap(event:KeyboardEvent):void {
			if (_topToolbar.leftButton && _topToolbar.leftButton.visible && event.keyCode == Keyboard.BACK) {
				_topToolbar.leftButton.dispatchEvent(new MouseEvent(MouseEvent.CLICK));
			}
		}
		
		protected function createToolbar():TopToolbarBase {
			return new TopToolbarBase();
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_topToolbar.height = getStyle("toolbarHeight");
		}
	}
}
