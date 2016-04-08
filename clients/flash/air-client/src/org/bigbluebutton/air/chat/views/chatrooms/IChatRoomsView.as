package org.bigbluebutton.air.chat.views.chatrooms {
	
	import spark.components.List;
	
	import org.bigbluebutton.air.common.views.IView;
	
	public interface IChatRoomsView extends IView {
		function get list():List;
	}
}
