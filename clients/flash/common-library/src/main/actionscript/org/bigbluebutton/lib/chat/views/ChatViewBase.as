package org.bigbluebutton.lib.chat.views {
	import mx.core.ClassFactory;
	import mx.core.ScrollPolicy;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.List;
	import spark.components.Scroller;
	import spark.components.TextInput;
	import spark.components.VGroup;
	
	public class ChatViewBase extends VGroup {
		private var _chatList:List;
		
		public function get chatList():List {
			return _chatList;
		}
		
		private var _inputGroup:HGroup;
		
		private var _sendButton:Button;
		
		public function get sendButton():Button {
			return _sendButton;
		}
		
		private var _textInput:TextInput;
		
		public function get textInput():TextInput {
			return _textInput;
		}
		
		public function ChatViewBase() {
			super();
			
			var scroller:Scroller = new Scroller();
			scroller.percentWidth = 100;
			scroller.percentHeight = 100;
			scroller.setStyle("horizontalScrollPolicy", "off");
			
			var sGroup:VGroup = new VGroup();
			sGroup.percentWidth = 100;
			sGroup.percentHeight = 100;
			sGroup.setStyle("horizontalScrollPolicy", "off");
			scroller.viewport = sGroup;
			
			_chatList = new List();
			_chatList.percentWidth = 100;
			_chatList.percentHeight = 100;
			_chatList.setStyle("horizontalScrollPolicy", "off");
			var itemRendererClass:ClassFactory = new ClassFactory(ChatItemRenderer);
			_chatList.itemRenderer = itemRendererClass; //org.bigbluebutton.air.chat.views.chat.ChatItemRenderer
			sGroup.addElement(_chatList);
			
			addElement(scroller);
			
			_inputGroup = new HGroup();
			_inputGroup.percentWidth = 100;
			_inputGroup.verticalAlign = "middle";
			_inputGroup.horizontalAlign = "center";
			_inputGroup.gap = 0;
			
			_textInput = new TextInput();
			_textInput.percentWidth = 100;
			_textInput.percentHeight = 100;
			//_textInput.showPromptWhenFocused = false;
			_textInput.styleName = "messageInput";
			_inputGroup.addElement(_textInput);
			
			_sendButton = new Button();
			_sendButton.percentHeight = 100;
			_sendButton.label = "\ue90b";
			//enabled="{inputMessage0.text!=''}"
			_sendButton.styleName = "sendButton";
			_inputGroup.addElement(_sendButton);
			
			addElement(_inputGroup);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			_inputGroup.height = getStyle('chatInputTextHeight');
			_sendButton.width = getStyle('btnWidth');
			
			super.updateDisplayList(w, h);
		}
	}
}
