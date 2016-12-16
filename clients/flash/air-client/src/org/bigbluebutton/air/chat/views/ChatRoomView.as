package org.bigbluebutton.air.chat.views {
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	
	public class ChatRoomView extends NoTabView {
		private var _topToolbar:TopToolbarChat;
		
		public function ChatRoomView() {
			super();
			styleName = "mainView";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			_topToolbar = new TopToolbarChat();
			_topToolbar.percentWidth = 100;
			addElement(_topToolbar);
			
			var skinnableWrapper:SkinnableContainer = new SkinnableContainer();
			skinnableWrapper.styleName = "subViewContent";
			skinnableWrapper.percentWidth = 100;
			skinnableWrapper.percentHeight = 100;
			
			var participantsView:ChatViewBase = new ChatViewBase();
			participantsView.percentWidth = 100;
			participantsView.percentHeight = 100;
			skinnableWrapper.addElement(participantsView);
			
			addElement(skinnableWrapper);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			_topToolbar.height = getStyle("toolbarHeight");
		}
	}
}
