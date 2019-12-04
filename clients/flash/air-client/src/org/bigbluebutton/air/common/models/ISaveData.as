package org.bigbluebutton.air.common.models {
	
	public interface ISaveData {
		function save(name:String, obj:Object):void
		function read(name:String):Object
	}
}
