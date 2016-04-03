package org.bigbluebutton.air.chat.views.chatrooms {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.List;
	import spark.components.TextInput;
	
	public interface IChatRoomsView extends IView {
		function get list():List;
	}
}
