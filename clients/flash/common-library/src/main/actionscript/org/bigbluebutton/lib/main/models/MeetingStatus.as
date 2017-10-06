package org.bigbluebutton.lib.main.models {
	import org.osflash.signals.Signal;
	
	public class MeetingStatus {
		private var _lockSettings:LockSettings2x = new LockSettings2x();
		
		private var _lockSettingsChangeSignal:Signal = new Signal();
		
		public function get lockSettingsChangeSignal():Signal {
			return _lockSettingsChangeSignal;
		}
		
		public function get lockSettings():LockSettings2x {
			return _lockSettings;
		}
		
		//public var isRecording: Boolean = false;
		//public var isMeetingMuted: Boolean = false;
		//public var guestPolicy: String = "ASK_MODERATOR";
		//public var guestPolicySetBy: String = null;
		
		public function changeLockSettings(newSettings:LockSettings2x):void {
			_lockSettings = newSettings; 
			_lockSettingsChangeSignal.dispatch(newSettings);
		}
	}
}
