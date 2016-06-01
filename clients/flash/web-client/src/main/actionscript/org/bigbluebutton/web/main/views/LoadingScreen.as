package org.bigbluebutton.web.main.views {
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.SkinnableContainer;
	import spark.layouts.VerticalLayout;
	
	public class LoadingScreen extends SkinnableContainer implements ILoadingScreen {
		private var _stateLabel:Label; // Downloading, Joining, Authenticating, Enter API, Config, Connecting
		
		public function get stateLabel():Label {
			return _stateLabel;
		}
		
		public function LoadingScreen() {
			super();
			
			var l:VerticalLayout = new VerticalLayout();
			l.horizontalAlign = "center";
			l.verticalAlign = "middle";
			this.layout = l;
			this.setStyle("backgroundColor", 0xDDDDDD);
			this.setStyle("backgroundAlpha", 1);
			
			_stateLabel = new Label();
			_stateLabel.text = "Loading";
			addElement(_stateLabel);
			
			percentHeight = percentWidth = 100;
		}
	}
}


