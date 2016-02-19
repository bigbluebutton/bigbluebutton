package org.bigbluebutton.air.presentation.views.selectWebcam {
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.List;
	import spark.components.supportClasses.SkinnableComponent;
	
	public class SelectStreamPopUp extends SelectStreamPopUpBase implements ISelectStreamPopUp {
		
		public function get streamList():List {
			return streamList0;
		}
		
		public function get actionButton():Button {
			return actionButton0;
		}
		
		public function dispose():void {
		}
	}
}
