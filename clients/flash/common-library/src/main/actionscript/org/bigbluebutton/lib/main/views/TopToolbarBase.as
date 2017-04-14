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
			
			verticalCenter = 0;

			_leftButton = new Button();
			_leftButton.styleName = "participantsButton topButton topLeftButton";
			addElement(_leftButton);

			_titleLabel = new Label();
			_titleLabel.styleName = "titleLabel";
			addElement(_titleLabel);

			_rightButton = new Button();
			_rightButton.styleName = "settingsButton topButton topRightButton";
			addElement(_rightButton);
		}
	}
}
