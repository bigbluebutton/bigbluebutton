package org.bigbluebutton.lib.main.views {
	
	import spark.components.Button;
	import spark.components.HGroup;
	
	[Style(name = "bottom", inherit = "no", type = "Number")]
	[Style(name = "gap", inherit = "no", type = "Number")]
	[Style(name = "top", inherit = "no", type = "Number")]
	public class MenuButtonsBase extends HGroup {
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
			
			
			_micButton = new Button();
			_micButton.percentWidth = 100;
			_micButton.percentHeight = 100;
			_micButton.label = "Mic on";
			_micButton.styleName = "micOnButton menuButton";
			addElement(_micButton);
			
			_camButton = new Button();
			_camButton.percentWidth = 100;
			_camButton.percentHeight = 100;
			_camButton.label = "Cam on";
			_camButton.styleName = "camOnButton menuButton";
			addElement(_camButton);
			
			_statusButton = new Button();
			_statusButton.percentWidth = 100;
			_statusButton.percentHeight = 100;
			_statusButton.label = "Status";
			_statusButton.styleName = "handStatusButton menuButton";
			addElement(_statusButton);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			bottom = getStyle("bottom");
			gap = getStyle("gap");
			top = getStyle("top");
		}
	}
}
