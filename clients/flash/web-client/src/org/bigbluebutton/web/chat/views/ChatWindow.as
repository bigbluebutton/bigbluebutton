package org.bigbluebutton.web.chat.views {
	import flash.display.DisplayObject;
	
	import mx.containers.ViewStack;
	
	import org.bigbluebutton.web.window.views.BBBWindow;
	
	import spark.components.NavigatorContent;
	import spark.components.TabBar;
	import spark.components.VGroup;
	import spark.layouts.VerticalLayout;
	
	public class ChatWindow extends BBBWindow {
		private var tabBar:TabBar;
		
		private var stack:ViewStack;
		
		public function ChatWindow() {
			super();
			
			title = "Chat";
			width = 300;
			height = 400;
			
			var g1:VGroup = new VGroup();
			g1.percentHeight = 100;
			g1.percentWidth = 100;
			g1.gap = 0;
			
			stack = new ViewStack();
			stack.percentHeight = 100;
			stack.percentWidth = 100;
			
			tabBar = new TabBar();
			tabBar.percentWidth = 100;
			tabBar.dataProvider = stack;
			
			g1.addElement(tabBar);
			g1.addElement(stack);
			
			addElement(g1);
		}
		
		public function addView(view:NavigatorContent):void {
			stack.addChild(view);
		}
		
		public function findChatView(userID:String):ChatView {
			var n:int = stack.numChildren;
			for (var i:int = 0; i < n; i++) {
				var view:DisplayObject = stack.getChildAt(i);
				if ((view is ChatView) && ChatView(view).userID == userID) return ChatView(view);
			}
			return null;
		}
	}
}
