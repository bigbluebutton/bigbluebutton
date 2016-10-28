package org.bigbluebutton.lib.main.views {
	
	import org.bigbluebutton.lib.main.views.skins.MenuButtonSkin;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.layouts.HorizontalLayout;
	
	public class MenuButtonsBase extends Group {
		private var _micButton:Button;
		
		public function get micButton():Button {
			return _micButton;
		}
		
		private var _camButton:Button;
		
		public function get camButton():Button {
			return _camButton;
		}
		
		private var _statusButton:Button;
		
		public function get statusButton():Button {
			return _statusButton;
		}
		
		public function MenuButtonsBase() {
			super();
			
			var l:HorizontalLayout = new HorizontalLayout();
			l.gap = 10;
			layout = l;
			
			_micButton = new Button();
			_micButton.percentWidth = 100;
			_micButton.percentHeight = 100;
			_micButton.label = "Mic on";
			_micButton.styleName = "micOnButtonStyle menuButtonStyle";
			addElement(_micButton);
			
			_camButton = new Button();
			_camButton.percentWidth = 100;
			_camButton.percentHeight = 100;
			_camButton.label = "Cam on";
			_camButton.styleName = "camOnButtonStyle menuButtonStyle";
			addElement(_camButton);
			
			_statusButton = new Button();
			_statusButton.percentWidth = 100;
			_statusButton.percentHeight = 100;
			_statusButton.label = "Status";
			_statusButton.styleName = "handStatusButtonStyle menuButtonStyle";
			addElement(_statusButton);
		}
	}
}
