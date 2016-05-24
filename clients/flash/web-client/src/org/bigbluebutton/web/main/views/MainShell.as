package org.bigbluebutton.web.main.views {
	import mx.core.FlexGlobals;
	
	import org.bigbluebutton.web.chat.views.ChatPanel;
	import org.bigbluebutton.web.common.views.VariableDividedBox;
	import org.bigbluebutton.web.participants.views.ParticipantsPanel;
	
	public class MainShell extends VariableDividedBox {
		private var _participantsPanel:ParticipantsPanel;
		
		public function get participantsPanel():ParticipantsPanel {
			return _participantsPanel;
		}
		
		private var _chatPanel:ChatPanel;
		
		public function get chatPanel():ChatPanel {
			return _chatPanel;
		}
		
		private var _mainPanel:MainPanel;
		
		private var _subBox:VariableDividedBox;
		
		public function MainShell() {
			super();
			
			//this.setStyle("gap", 0);
			this.direction = "horizontal";
		}
		
		public function createPanels():void {
			var appWidth:Number = FlexGlobals.topLevelApplication.width;
			var appHeight:Number = FlexGlobals.topLevelApplication.height;
			
			_participantsPanel = new ParticipantsPanel();
			_participantsPanel.width = appWidth * 0.25;
			_participantsPanel.percentHeight = 100;
			addChild(_participantsPanel);
			
			_subBox = new VariableDividedBox();
			_subBox.percentWidth = 75;
			_subBox.percentHeight = 100;
			_subBox.direction = "horizontal";
			addChild(_subBox);
			
			_chatPanel = new ChatPanel();
			_chatPanel.width = appWidth * 0.75 * 0.33;
			_chatPanel.percentHeight = 100;
			_subBox.addChild(_chatPanel);
			
			_mainPanel = new MainPanel();
			_mainPanel.percentWidth = 67;
			_mainPanel.percentHeight = 100;
			_subBox.addChild(_mainPanel);
		}
	}
}
