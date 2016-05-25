package org.bigbluebutton.air.main.views.menubuttons.changestatus {
	import spark.components.List;
	
	public class ChangeStatusPopUp extends ChangeStatusPopUpBase implements IChangeStatusPopUp {
		
		public function get statusList():List {
			return statusList0;
		}
		
		public function dispose():void {
		}
	}
}
