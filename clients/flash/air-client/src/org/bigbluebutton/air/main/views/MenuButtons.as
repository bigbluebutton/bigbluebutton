package org.bigbluebutton.air.main.views {
	
	import spark.components.Button;
	import spark.components.HGroup;
	
	[Style(name = "bottom", inherit = "no", type = "Number")]
	[Style(name = "gap", inherit = "no", type = "Number")]
	[Style(name = "top", inherit = "no", type = "Number")]
	
	public class MenuButtons extends HGroup {
		private var _audioButton:Button;
		
		public function get audioButton():Button {
			return _audioButton;
		}
		
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
		
		public function MenuButtons() {
			super();
			
			_micButton = new Button();
			_micButton.percentWidth = 100;
			_micButton.percentHeight = 100;
			_micButton.label = "Mic on";
			_micButton.styleName = "icon-unmute menuButton";
			addElement(_micButton);
			
			_audioButton = new Button();
			_audioButton.percentWidth = 100;
			_audioButton.percentHeight = 100;
			_audioButton.label = "Join";
			_audioButton.styleName = "icon-audio-on menuButton";
			addElement(_audioButton);
			
			_camButton = new Button();
			_camButton.percentWidth = 100;
			_camButton.percentHeight = 100;
			_camButton.label = "Cam on";
			_camButton.styleName = "icon-video menuButton";
			addElement(_camButton);
			
			_statusButton = new Button();
			_statusButton.percentWidth = 100;
			_statusButton.percentHeight = 100;
			_statusButton.label = "Status";
			_statusButton.styleName = "icon-hand menuButton";
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
