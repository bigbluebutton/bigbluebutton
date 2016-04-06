package org.bigbluebutton.air.users.views.participants {
	import spark.components.Button;
	import spark.components.List;
	import spark.components.supportClasses.SkinnableComponent;
	
	public class ParticipantsView extends ParticipantsViewBase implements IParticipantsView {
		
		public function get list():List {
			return participantslist;
		}
		
		public function get guestsList():List {
			return guestslist;
		}
		
		public function get allGuests():SkinnableComponent {
			return allguests;
		}
		
		public function get allowAllButton():Button {
			return allowAllButton0;
		}
		
		public function get denyAllButton():Button {
			return denyAllButton0;
		}
		
		public function get conversationsList():List {
			return conversationslist;
		}
		
		public function dispose():void {
		}
	
	}
}
