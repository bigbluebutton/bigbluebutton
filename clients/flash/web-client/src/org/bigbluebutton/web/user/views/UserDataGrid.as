package org.bigbluebutton.web.user.views {
	import org.osflash.signals.Signal;
	
	import spark.components.DataGrid;
	
	public class UserDataGrid extends DataGrid {
		public var amIModerator:Boolean = true;
		
		private var lowerHandSignal:Signal; 
		private var changePresenterSignal:Signal;
		private var changeMuteSignal:Signal; 
		private var kickUserSignal:Signal;
		
		public function UserDataGrid() {
			super();
		}
		
		public function setupSignals(lowerHandSignal:Signal, changePresenterSignal:Signal, changeMuteSignal:Signal, kickUserSignal:Signal):void {
			this.lowerHandSignal = lowerHandSignal;
			this.changePresenterSignal = changePresenterSignal;
			this.changeMuteSignal = changeMuteSignal;
			this.kickUserSignal = kickUserSignal;
		}
		
		public function lowerHand(userID:String):void {
			if (lowerHandSignal != null) {
				lowerHandSignal.dispatch(userID);
			}
		}
		
		public function changePresenter(userID:String):void {
			if (changePresenterSignal != null) {
				changePresenterSignal.dispatch(userID);
			}
		}
		
		public function changeMute(userID:String, mute:Boolean):void {
			if (changeMuteSignal != null) {
				changeMuteSignal.dispatch(userID, mute);
			}
		}
		
		public function kickUser(userID:String):void {
			if (kickUserSignal != null) {
				kickUserSignal.dispatch(userID);
			}
		}
	}
}
