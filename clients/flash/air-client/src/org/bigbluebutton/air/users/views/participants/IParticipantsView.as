package org.bigbluebutton.air.users.views.participants {
	
	import spark.components.List;
	
	import org.bigbluebutton.air.common.views.IView;
	
	public interface IParticipantsView extends IView {
		function get list():List;
		function get conversationsList():List;
	}
}
