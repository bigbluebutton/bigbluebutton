package org.bigbluebutton.air.poll.models {
	
	public class PollAnswer {
		private var _id:Number;
		
		private var _key:String;
		
		public function PollAnswer(id:Number, key:String) {
			_id = id;
			_key = key;
		}
		
		public function get id():Number {
			return _id;
		}
		
		public function get key():String {
			return _key;
		}
	}
}
