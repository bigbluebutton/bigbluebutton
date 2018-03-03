package org.bigbluebutton.air.chat.views {
	import org.bigbluebutton.air.common.views.NoTabView;
	import org.bigbluebutton.air.main.views.TopToolbarAIR;
	
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
		
		override protected function createToolbar():TopToolbarAIR {
			return new TopToolbarChat();
		}
	}
}
