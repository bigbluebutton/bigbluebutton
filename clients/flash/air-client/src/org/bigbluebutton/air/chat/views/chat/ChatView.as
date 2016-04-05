package org.bigbluebutton.air.chat.views.chat {
	
	import mx.core.FlexGlobals;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.TextInput;
	
	public class ChatView extends ChatViewBase implements IChatView {
		public function get list():List {
			return chatlist;
		}
		
		public function get inputMessage():TextInput {
			return inputMessage0;
		}
		
		public function get sendButton():Button {
			return sendButton0;
		}
		
		public function get pageName():Label {
			return FlexGlobals.topLevelApplication.topActionBar.pageName;
		}
		
		public function get newMessages():Group {
			return newMessagesBar;
		}
		
		public function get newMessagesLabel():Label {
			return newMessagesLabel0;
		}
		
		public function dispose():void {
		}
	}
}
