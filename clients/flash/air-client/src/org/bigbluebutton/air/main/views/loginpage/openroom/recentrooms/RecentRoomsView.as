package org.bigbluebutton.air.main.views.loginpage.openroom.recentrooms {
	
	import spark.components.List;
	
	public class RecentRoomsView extends RecentRoomsViewBase implements IRecentRoomsView {
		
		public function dispose():void {
		}
		
		public function get roomsList():List {
			return roomsList0;
		}
	}
}
