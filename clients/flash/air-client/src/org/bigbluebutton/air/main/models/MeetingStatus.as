package org.bigbluebutton.air.main.models {
	import org.osflash.signals.Signal;
	
	public class MeetingStatus {
		private var _lockSettings:LockSettings2x = new LockSettings2x();
		
		private var _lockSettingsChangeSignal:Signal = new Signal();
		
		private var _recordingStatusChangedSignal:Signal = new Signal();
		
		public function get lockSettingsChangeSignal():Signal {
			return _lockSettingsChangeSignal;
		}
		
		public function get recordingStatusChangedSignal():Signal {
			return _recordingStatusChangedSignal;
		}
		
		public function get lockSettings():LockSettings2x {
			return _lockSettings;
		}
		
		private var _isRecording:Boolean = false;
		
		public function get isRecording():Boolean {
			return _isRecording;
		}
		
		public function set recording(newValue:Boolean):void {
			_isRecording = newValue;
			_recordingStatusChangedSignal.dispatch(newValue);
		}
		
		//public var isMeetingMuted: Boolean = false;
		//public var guestPolicy: String = "ASK_MODERATOR";
		//public var guestPolicySetBy: String = null;
		
		public function changeLockSettings(newSettings:LockSettings2x):void {
			_lockSettings = newSettings;
			_lockSettingsChangeSignal.dispatch(newSettings);
		}
	}
}
