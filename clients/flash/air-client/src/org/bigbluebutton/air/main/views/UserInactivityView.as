package org.bigbluebutton.air.main.views {
	import spark.components.Button;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.HorizontalLayout;
	import spark.layouts.VerticalLayout;
	
	public class UserInactivityView extends MobilePopUp {
		private var _okButton:Button;
		
		public function get okButton():Button {
			return _okButton;
		}
		
		public function UserInactivityView() {
			super();
			
			_okButton = new Button();
			_okButton.label = "Reset Timer"
			
			_title = "Inactivity Timer";
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == contentGroup) {
				var contentGroupLayout:HorizontalLayout = new HorizontalLayout();
				contentGroupLayout.horizontalAlign = HorizontalAlign.CENTER;
				contentGroup.layout = contentGroupLayout;
				contentGroup.addElement(okButton);
			}
		}
		
		override protected function updateDisplayList(unscaledWidth:Number, unscaledHeight:Number):void {
			super.updateDisplayList(unscaledWidth, unscaledHeight);
			VerticalLayout(chrome.layout).padding = getStyle("padding");
			HorizontalLayout(contentGroup.layout).padding = getStyle("padding");
		}
	}
}
