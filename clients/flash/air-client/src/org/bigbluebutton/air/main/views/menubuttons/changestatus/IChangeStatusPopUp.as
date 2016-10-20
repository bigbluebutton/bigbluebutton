package org.bigbluebutton.air.main.views.menubuttons.changestatus {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.List;
	
	public interface IChangeStatusPopUp extends IView {
		function get statusList():List;
	}
}
