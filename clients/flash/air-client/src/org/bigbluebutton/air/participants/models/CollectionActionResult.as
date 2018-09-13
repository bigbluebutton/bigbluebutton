package org.bigbluebutton.air.participants.models {
	
	public class CollectionActionResult {
		
		private var _action:String;
		
		private var _item:Object;
		
		public function get action():String {
			return _action;
		}
		
		public function get item():Object {
			return _item;
		}
		
		public function CollectionActionResult(action:String = "update", item:Object = null) {
			_action = action;
			_item = item;
		}
	}
}
