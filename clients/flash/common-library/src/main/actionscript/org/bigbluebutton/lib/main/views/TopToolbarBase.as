package org.bigbluebutton.lib.main.views {
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	
	public class TopToolbarBase extends Group {
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
			
			_leftButton = new Button();
			_leftButton.styleName = "icon-user topButton topLeftButton";
			_leftButton.verticalCenter = 0;
			addElement(_leftButton);
			
			_titleLabel = new Label();
			_titleLabel.styleName = "titleLabel";
			_titleLabel.verticalCenter = 0;
			addElement(_titleLabel);
			
			_rightButton = new Button();
			_rightButton.styleName = "icon-more topButton topRightButton";
			_rightButton.verticalCenter = 0;
			addElement(_rightButton);
		}
	}
}
