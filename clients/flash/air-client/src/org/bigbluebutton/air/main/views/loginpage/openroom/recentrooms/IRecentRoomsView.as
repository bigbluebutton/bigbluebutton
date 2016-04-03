package org.bigbluebutton.air.main.views.loginpage.openroom.recentrooms {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.Group;
	import spark.components.Label;
	import spark.components.List;
	import spark.components.RadioButtonGroup;
	import spark.components.TextInput;
	
	public interface IRecentRoomsView extends IView {
		function get roomsList():List;
	}
}
