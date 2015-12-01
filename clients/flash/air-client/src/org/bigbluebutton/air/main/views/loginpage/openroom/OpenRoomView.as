package org.bigbluebutton.air.main.views.loginpage.openroom {
	
	import spark.components.Button;
	import spark.components.List;
	import spark.components.TextInput;
	
	public class OpenRoomView extends OpenRoomViewBase implements IOpenRoomView {
		override protected function childrenCreated():void {
			super.childrenCreated();
		}
		
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
