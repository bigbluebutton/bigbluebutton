package org.bigbluebutton.air.users.views.participants {
	
	import org.bigbluebutton.air.common.views.IView;
	
	import spark.components.Button;
	import spark.components.List;
	import spark.components.supportClasses.SkinnableComponent;
	
	public interface IParticipantsView extends IView {
		function get list():List;
		function get guestsList():List;
		function get allGuests():SkinnableComponent;
		function get allowAllButton():Button;
		function get denyAllButton():Button;
		function get conversationsList():List;
	}
}
