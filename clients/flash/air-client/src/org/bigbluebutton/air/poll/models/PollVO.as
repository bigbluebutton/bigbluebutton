package org.bigbluebutton.air.poll.models {
	
	public class PollVO {
		private var _id:String;
		
		private var _answers:Array;
		
		private var _answered:Boolean
		
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
		
		public function get answered():Boolean {
			return _answered;
		}
		
		public function set answered(value:Boolean):void {
			_answered = value;
		}
	}
}
