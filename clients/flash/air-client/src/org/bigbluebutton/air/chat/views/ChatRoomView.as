package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.lib.chat.views.ChatViewBase;
	
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	public class ChatRoomView extends NoTabView {
		public function ChatRoomView() {
			super();
			styleName = "mainView";
			
			var l:VerticalLayout = new VerticalLayout();
			l.gap = 0;
			l.horizontalAlign = "center";
			layout = l;
			
			var topToolbar:TopToolbarChat = new TopToolbarChat();
			topToolbar.percentWidth = 100;
			topToolbar.height = 60;
			addElement(topToolbar);
			
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
	}
}
