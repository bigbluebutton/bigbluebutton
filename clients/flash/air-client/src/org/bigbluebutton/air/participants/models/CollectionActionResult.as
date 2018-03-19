package org.bigbluebutton.air.participants.models {
	
	public class CollectionActionResult {
		
		private var _action:String;
		
		private var _item:Object;
		
		private var _oldIndex:int;
		
		private var _newIndex:int;
		
		public function get action():String {
			return _action;
		}
		
		public function get item():Object {
			return _item;
		}
		
		public function get newIndex():int {
			return _newIndex;
		}
		
		public function CollectionActionResult(action:String = "update", item:Object = null, newIndex:int = 0) {
			_action = action;
			_item = item;
			_newIndex = newIndex;
		}
	}
}
