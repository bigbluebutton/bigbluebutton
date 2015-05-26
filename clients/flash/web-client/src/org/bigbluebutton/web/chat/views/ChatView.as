package org.bigbluebutton.web.chat.views {
	import mx.core.ClassFactory;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.List;
	import spark.components.NavigatorContent;
	import spark.components.TextArea;
	import spark.layouts.VerticalLayout;
	
	public class ChatView extends NavigatorContent {
		public var userID:String;
		
		public var messageList:List;
		public var inputArea:TextArea;
		public var sendButton:Button;
		
		public function ChatView() {
			super();
			
			layout = new VerticalLayout();
			
			messageList = new List();
			messageList.setStyle("horizontalScrollPolicy", "off");
			messageList.percentHeight = 100;
			messageList.percentWidth = 100;
			messageList.itemRenderer = new ClassFactory(ChatItemRenderer);
			addElement(messageList);
			
			var g1:Group = new HGroup();
			g1.percentWidth = 100;
			
			inputArea = new TextArea();
			inputArea.height = 40;
			inputArea.percentWidth = 100;
			g1.addElement(inputArea);
			
			sendButton = new Button();
			sendButton.label = "Send";
			g1.addElement(sendButton);
			
			addElement(g1);
		}
	}
}
