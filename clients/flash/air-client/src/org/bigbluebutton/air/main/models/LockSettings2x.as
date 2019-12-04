package org.bigbluebutton.air.main.models {
	
	public class LockSettings2x {
		public var disableCam:Boolean;
		
		public var disableMic:Boolean;
		
		public var disablePrivChat:Boolean;
		
		public var disablePubChat:Boolean;
		
		public var lockedLayout:Boolean;
		
		public var lockOnJoin:Boolean;
		
		public var lockOnJoinConfigurable:Boolean;
		
		public function LockSettings2x() {
			disableCam = false;
			disableMic = false;
			disablePrivChat = false;
			disablePubChat = false;
			lockedLayout = false;
			lockOnJoin = true;
			lockOnJoinConfigurable = false;
		}
		
		public function isRoomLocked():Boolean {
			return disableCam || disableMic || disablePrivChat || disablePubChat || lockedLayout; 
		}
	}
}
