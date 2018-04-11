package org.bigbluebutton.air.poll.models {
	import org.osflash.signals.Signal;
	
	public class Polls {
		private var _currentPoll:PollVO;
		
		private var _userChangeSignal:Signal = new Signal();
		
		public function setCurrentPoll(poll:PollVO):void {
			_currentPoll = poll;
			_pollChangeSignal.dispatch(poll, PollChangeEnum.START);
		}
		
		public function removeCurrentPoll():void {
			_currentPoll = null;
			_pollChangeSignal.dispatch(null, PollChangeEnum.STOP);
		}
		
		public function voteCurrentPoll():void {
			_currentPoll.answered = true;
		}
		
		public function getCurrentPoll():PollVO {
			return _currentPoll;
		}
		
		private var _pollChangeSignal:Signal;
		
		public function get pollChangeSignal():Signal {
			return _pollChangeSignal;
		}
		
		public function Polls() {
			_pollChangeSignal = new Signal();
		}
	}
}
