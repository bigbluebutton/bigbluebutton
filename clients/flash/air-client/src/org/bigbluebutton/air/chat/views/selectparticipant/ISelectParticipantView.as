package org.bigbluebutton.air.chat.views.selectparticipant {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.List;
	
	public interface ISelectParticipantView extends IView {
		function get list():List;
	}
}
