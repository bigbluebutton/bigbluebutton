package org.bigbluebutton.air.main.views {
	import spark.components.Button;
	import spark.layouts.HorizontalAlign;
	import spark.layouts.HorizontalLayout;
	import spark.layouts.VerticalLayout;
	
	public class UserInactivityPopUp extends MobilePopUp {
		private var _okButton:Button;
		
		public function get okButton():Button {
			return _okButton;
		}
		
		public function UserInactivityPopUp() {
			super();
			
			_okButton = new Button();
			_okButton.label = "Reset Timer"
			
			_title = "Inactivity Timer";
		}
		
		override protected function partAdded(partName:String, instance:Object):void {
			super.partAdded(partName, instance);
			
			if (instance == chrome) {
				VerticalLayout(chrome.layout).padding = getStyle("padding");
			}
			
			if (instance == contentGroup) {
				var contentGroupLayout:HorizontalLayout = new HorizontalLayout();
				contentGroupLayout.horizontalAlign = HorizontalAlign.CENTER;
				contentGroupLayout.padding = getStyle("padding");
				contentGroup.layout = contentGroupLayout;
				contentGroup.addElement(okButton);
			}
		}
	}
}
