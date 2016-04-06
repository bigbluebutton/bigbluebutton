package org.bigbluebutton.air.main.views.loginpage.openroom {
	
	import spark.components.Button;
	import spark.components.TextInput;
	
	public class OpenRoomView extends OpenRoomViewBase implements IOpenRoomView {
		
		public function get inputRoom():TextInput {
			return inputRoom0;
		}
		
		public function get goButton():Button {
			return goButton0;
		}
		
		public function dispose():void {
		}
	}
}
