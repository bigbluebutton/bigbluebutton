package org.bigbluebutton.air.common.models {
	
	import flash.net.SharedObject;
	
	public class SaveData implements ISaveData {
		private var sharedObject:SharedObject;
		
		public function SaveData() {
			sharedObject = SharedObject.getLocal("bbb");
		}
		
		public function save(name:String, obj:Object):void {
			sharedObject.data[name] = obj;
			sharedObject.flush();
		}
		
		public function read(name:String):Object {
			return sharedObject.data[name];
		}
	}
}
