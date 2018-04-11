package org.bigbluebutton.air.common.views {
	
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.StageOrientationEvent;
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
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage, false, 0, true);
		}
		
		protected function onAddedToStage(event:Event):void {
			stage.addEventListener(StageOrientationEvent.ORIENTATION_CHANGE, onOrientationChange, false, 0, true);
		}
		
		/**
		 * Override this method in subclasses to be notified of rotation changes
		 */
		protected function onOrientationChange(event:Event):void {
			invalidateDisplayList();
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
