package org.bigbluebutton.air.chat.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.List;
	
	public interface IChatRoomsView extends IView {
		function get list():List;
	}
}
