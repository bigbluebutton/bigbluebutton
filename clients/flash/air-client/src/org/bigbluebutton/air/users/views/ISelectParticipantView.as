package org.bigbluebutton.air.users.views {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.List;
	
	public interface ISelectParticipantView extends IView {
		function get list():List;
	}
}
