package org.bigbluebutton.air.users.views.participants {
	import spark.components.List;
	
	public class ParticipantsView extends ParticipantsViewBase implements IParticipantsView {
		
		public function get list():List {
			return participantslist;
		}
		
		public function get conversationsList():List {
			return conversationslist;
		}
		
		public function dispose():void {
		}
	
	}
}
