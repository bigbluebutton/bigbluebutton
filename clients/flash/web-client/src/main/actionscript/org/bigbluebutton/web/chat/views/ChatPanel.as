package org.bigbluebutton.web.chat.views {
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	import org.bigbluebutton.web.common.views.IPanelAdjustable;
	
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	public class ChatPanel extends SkinnableContainer implements IPanelAdjustable {
		private var _adjustable:Boolean = false;
		
		public function set adjustable(v:Boolean):void {
			_adjustable = v;
		}
		
		public function get adjustable():Boolean {
			return _adjustable;
		}
		
		private var _title:Label;
		
		public function get title():Label {
			return _title;
		}
		
		private var _closeButton:Button;
		
		public function get closeButton():Button {
			return _closeButton;
		}
		
		public function ChatPanel() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			this.layout = l;
			this.minWidth = 50;
			this.styleName = "panel";
			
			var g:HGroup = new HGroup();
			g.percentWidth = 100;
			
			_title = new Label();
			_title.percentWidth = 100;
			_title.text = "Public Chat";
			_title.styleName = "panelTitle";
			g.addElement(title);
			
			_closeButton = new Button();
			_closeButton.label = "X";
			g.addElement(_closeButton);
			
			addElement(g);
			
			var _chatView:ChatViewBase = new ChatViewBase();
			_chatView.percentWidth = 100;
			_chatView.percentHeight = 100;
			addElement(_chatView);
		}
	}
}