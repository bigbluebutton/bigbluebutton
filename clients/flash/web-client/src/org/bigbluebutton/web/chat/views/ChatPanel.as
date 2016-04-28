package org.bigbluebutton.web.chat.views {
	import mx.graphics.SolidColor;
	
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	import org.bigbluebutton.web.common.views.IPanelAdjustable;
	
	import spark.components.Group;
	import spark.primitives.Rect;
	
	public class ChatPanel extends Group implements IPanelAdjustable {
		private var _adjustable:Boolean = false;
		
		public function set adjustable(v:Boolean):void {
			_adjustable = v;
		}
		
		public function get adjustable():Boolean {
			return _adjustable;
		}
		
		public function ChatPanel() {
			super();
			
			var _chatView:ChatViewBase = new ChatViewBase();
			_chatView.percentWidth = 100;
			_chatView.percentHeight = 100;
			addElement(_chatView);
		}
	}
}