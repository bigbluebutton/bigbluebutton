package org.bigbluebutton.air.poll.models {
	
	public class PollVO {
		private var _id:String;
		
		private var _answers:Array;
		
		public function PollVO(id:String, answers:Array) {
			_id = id;
			_answers = answers;
		}
		
		public function get id():String {
			return _id;
		}
		
		public function get answers():Array {
			return _answers;
		}
	}
}
