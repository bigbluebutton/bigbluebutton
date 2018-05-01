package org.bigbluebutton.air.main.views {
	
	import spark.components.Button;
	import spark.components.SkinnableContainer;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.HorizontalLayout;
	import spark.layouts.VerticalAlign;
	
	[Style(name = "bottom", inherit = "no", type = "Number")]
	[Style(name = "gap", inherit = "no", type = "Number")]
	[Style(name = "top", inherit = "no", type = "Number")]
	
	public class MenuButtons extends SkinnableContainer {
		private var _audioButton:Button;
		
		private var bLayout:HorizontalLayout
		
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
			
			bLayout = new HorizontalLayout();
			bLayout.horizontalAlign = HorizontalAlign.CENTER;
			bLayout.verticalAlign = VerticalAlign.MIDDLE;
			layout = bLayout;
			
			_micButton = new Button();
			_micButton.styleName = "icon-unmute menuButton";
			addElement(_micButton);
			
			_audioButton = new Button();
			_audioButton.styleName = "icon-audio-on menuButton";
			addElement(_audioButton);
			
			_camButton = new Button();
			_camButton.styleName = "icon-video menuButton";
			addElement(_camButton);
			
			_statusButton = new Button();
			_statusButton.styleName = "icon-hand menuButton";
			addElement(_statusButton);
		}
		
		override protected function updateDisplayList(w:Number, h:Number):void {
			super.updateDisplayList(w, h);
			
			bLayout.gap = getStyle("gap");
		}
	}
}
