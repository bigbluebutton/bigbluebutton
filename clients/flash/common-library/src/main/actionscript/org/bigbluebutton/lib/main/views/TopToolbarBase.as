package org.bigbluebutton.lib.main.views {
	import mx.controls.Spacer;
	
	import spark.components.Button;
	import spark.components.HGroup;
	import spark.components.Label;
	
	public class TopToolbarBase extends HGroup {
		private var _leftButton:Button;
		
		public function get leftButton():Button {
			return _leftButton;
		}
		
		private var _titleLabel:Label;
		
		public function get titleLabel():Label {
			return _titleLabel;
		}
		
		private var _rightButton:Button;
		
		public function get rightButton():Button {
			return _rightButton;
		}
		
		public function TopToolbarBase() {
			super();
			
			horizontalAlign = "center";
			verticalAlign = "middle";
			
			_leftButton = new Button();
			_leftButton.styleName = "participantsButtonStyle topButtonStyle";
			addElement(_leftButton);
			
			var s:Spacer = new Spacer();
			s.percentWidth = 100;
			addElement(s);
			
			_titleLabel = new Label();
			_titleLabel.styleName = "titleLabelStyle";
			addElement(_titleLabel);
			
			s = new Spacer();
			s.percentWidth = 100;
			addElement(s);
			
			_rightButton = new Button();
			_rightButton.styleName = "settingsButtonStyle topButtonStyle";
			addElement(_rightButton);
		}
	}
}
