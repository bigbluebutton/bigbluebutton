package org.bigbluebutton.lib.chat.views {
	import mx.core.ClassFactory;
	import mx.graphics.SolidColor;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.HGroup;
	import spark.components.List;
	import spark.components.Scroller;
	import spark.components.TextInput;
	import spark.components.VGroup;
	import spark.layouts.VerticalAlign;
	import spark.primitives.Rect;
	
	public class ChatViewBase extends VGroup {
		private var _chatList:List;
		
		public function get chatList():List {
			return _chatList;
		}
		
		private var _inputGroup:HGroup;
		
		private var _inputBackground:Rect;
		
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
			
			var sGroup:Group = new Group();
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
			
			var group:Group = new Group();
			group.percentWidth = 100;
			
			_inputBackground = new Rect();
			_inputBackground.percentHeight = 100;
			_inputBackground.percentWidth = 100;
			_inputBackground.fill = new SolidColor();
			
			group.addElement(_inputBackground);
			
			_inputGroup = new HGroup();
			_inputGroup.verticalAlign = VerticalAlign.MIDDLE;
			_inputGroup.percentWidth = 100;
			group.addElement(_inputGroup);
			
			_textInput = new TextInput();
			_textInput.percentWidth = 100;
			_textInput.percentHeight = 100;
			//_textInput.showPromptWhenFocused = false;
			_textInput.styleName = "messageInput";
			_inputGroup.addElement(_textInput);
			
			_sendButton = new Button();
			_sendButton.styleName = "sendButton icon icon-plus";
			//enabled="{inputMessage0.text!=''}"
			_inputGroup.addElement(_sendButton);
			
			addElement(group);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			SolidColor(_inputBackground.fill).color = getStyle("inputBackgroundColor");
			SolidColor(_inputBackground.fill).color = getStyle("inputBorderColor");
			_inputGroup.gap = getStyle("inputPadding");
			_inputGroup.padding = getStyle("inputPadding");
			super.updateDisplayList(w, h);
		}
	}
}
