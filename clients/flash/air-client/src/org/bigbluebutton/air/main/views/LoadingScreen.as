package org.bigbluebutton.air.main.views {
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.VerticalAlign;
	import spark.layouts.VerticalLayout;
	
	public class LoadingScreen extends SkinnableContainer {
		private var _stateLabel:Label; // Downloading, Joining, Authenticating, Enter API, Config, Connecting
		
		public function get stateLabel():Label {
			return _stateLabel;
		}
		
		public function LoadingScreen() {
			super();
			
			var layout:VerticalLayout = new VerticalLayout();
			layout.horizontalAlign = HorizontalAlign.CENTER;
			layout.verticalAlign = VerticalAlign.MIDDLE;
			this.layout = layout;
			
			_stateLabel = new Label();
			_stateLabel.text = "Loading";
			_stateLabel.percentWidth = 80;
			addElement(_stateLabel);
		}
	}
}
