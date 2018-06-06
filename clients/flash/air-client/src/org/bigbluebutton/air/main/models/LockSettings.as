package org.bigbluebutton.air.main.models {
	import org.osflash.signals.Signal;
	
	public class LockSettings {
		private var _disableCamSignal:Signal = new Signal();
		
		private var _disableMicSignal:Signal = new Signal();
		
		private var _disablePrivateChatSignal:Signal = new Signal();
		
		private var _disablePublicChatSignal:Signal = new Signal();
		
		private var _lockOnJoinConfigurable:Boolean;
		
		private var _disableCam:Boolean;
		
		private var _disableMic:Boolean;
		
		private var _disablePrivateChat:Boolean;
		
		private var _disablePublicChat:Boolean;
		
		private var _lockedLayout:Boolean;
		
		private var _lockOnJoin:Boolean;
		
		private var _loaded:Boolean = false;
		
		public function LockSettings() {
		}
		
		public function get disableCamSignal():Signal {
			return _disableCamSignal;
		}
		
		public function get disableMicSignal():Signal {
			return _disableMicSignal;
		}
		
		public function get disablePrivateChatSignal():Signal {
			return _disablePrivateChatSignal;
		}
		
		public function get disablePublicChatSignal():Signal {
			return _disablePublicChatSignal;
		}
		
		public function get disableCam():Boolean {
			return _disableCam;
		}
		
		public function get lockedLayout():Boolean {
			return _lockedLayout;
		}
		
		public function set disableCam(disable:Boolean):void {
			if (_disableCam != disable) {
				_disableCam = disable;
			}
		}
		
		public function get disableMic():Boolean {
			return _disableMic;
		}
		
		public function set disableMic(disable:Boolean):void {
			if (_disableMic != disable) {
				_disableMic = disable;
			}
		}
		
		public function get disablePrivateChat():Boolean {
			return _disablePrivateChat;
		}
		
		public function set disablePrivateChat(disable:Boolean):void {
			if (_disablePrivateChat != disable) {
				_disablePrivateChat = disable;
			}
		}
		
		public function get disablePublicChat():Boolean {
			return _disablePublicChat;
		}
		
		public function get loaded():Boolean {
			return _loaded;
		}
		
		public function set loaded(value:Boolean):void {
			_loaded = value;
		}
		
		public function set disablePublicChat(disable:Boolean):void {
			if (_disablePublicChat != disable) {
				_disablePublicChat = disable;
			}
		}
		
		public function set lockedLayout(disable:Boolean):void {
			_lockedLayout = disable;
		}
		
		public function get lockOnJoin():Boolean {
			return _lockOnJoin;
		}
		
		public function set lockOnJoin(disable:Boolean):void {
			_lockOnJoin = disable;
		}
		
		public function get lockOnJoinConfigurable():Boolean {
			return _lockOnJoinConfigurable;
		}
		
		public function set lockOnJoinConfigurable(disable:Boolean):void {
			_lockOnJoinConfigurable = disable;
		}
	}
}
